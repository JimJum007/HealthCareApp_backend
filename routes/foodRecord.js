const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();


// สร้าง Food Record ใหม่
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, time, date, calories } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || !time || !date || isNaN(calories)) {
      return res.status(400).json({ message: 'Invalid input data. Please provide name, time, date, and calories.' });
    }

    // ดึง userId จาก JWT ที่ตรวจสอบแล้ว
    const userId = req.user.userId;

    const record = await prisma.foodRecord.create({
      data: {
        userId, // ใช้ userId จาก JWT
        name: name.trim(),
        time: new Date(`${date}T${time}`), // รวมวันที่และเวลา
        date: new Date(date),
        calories: parseInt(calories),
      },
    });

    res.status(201).json({ message: 'Food record created successfully', record });
  } catch (error) {
    console.error('Error creating food record:', error);
    res.status(500).json({ error: 'Failed to create food record' });
  }
});


router.post('/data', async (req, res) => {
  try {
    const userId = req.body.userId;
    console.log('Received userId:', userId);

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const parsedUserId = parseInt(userId, 10);

    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'Invalid User ID format' });
    }

    const records = await prisma.foodRecord.findMany({
      where: { userId: parsedUserId },
      orderBy: [
        { date: 'desc' },
        { time: 'desc' },
      ],
    });

    // แปลงข้อมูลก่อนส่งกลับ
    const formattedRecords = records.map(record => {
      const time = new Date(record.time).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const date = new Date(record.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      return {
        id: record.id,
        userId: record.userId,
        name: record.name,
        time, // เวลาในรูปแบบ 12 ชั่วโมง เช่น "11:10 AM"
        date, // วันที่ในรูปแบบ "27 March 2025"
        calories: record.calories,
      };
    });

    res.status(200).json(formattedRecords);
  } catch (error) {
    console.error('Error fetching food records:', error);
    res.status(500).json({ error: 'Failed to fetch food records' });
  }
});

router.post('/total_calories', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const totalCalories = await prisma.foodRecord.aggregate({
      where: { userId: parseInt(userId, 10) },
      _sum: { calories: true },
    });

    return res.status(200).json({ totalCalories: totalCalories._sum.calories || 0 });
  } catch (error) {
    console.error('Error fetching total calories:', error);
    res.status(500).json({ error: 'Failed to fetch total calories' });
  }
});


router.post('/add_food', async (req, res) => {
  try {
    const { userId, name, time, date, calories } = req.body;

    if (!userId || !name || !time || !date || !calories) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // รวมวันที่และเวลา
    const [hour, minute, period] = time.split(/[: ]/); // แยกชั่วโมง นาที และ AM/PM
    const hour24 = period === 'PM' && hour !== '12' ? parseInt(hour) + 12 : parseInt(hour); // แปลงเป็นเวลา 24 ชั่วโมง
    const formattedTime = `${date}T${hour24.toString().padStart(2, '0')}:${minute}:00`; // รวมวันที่และเวลา

    const newFoodRecord = await prisma.foodRecord.create({
      data: {
        userId: parseInt(userId, 10),
        name,
        time: new Date(formattedTime), 
        date: new Date(date),
        calories: parseInt(calories, 10),
      },
    });

    return res.status(201).json({ message: 'Food record added successfully.', record: newFoodRecord });
  } catch (error) {
    console.error('Error adding food record:', error);
    return res.status(500).json({ error: 'Failed to add food record.' });
  }
});


router.get('/by-date/:date', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date } = req.params;

    // ตรวจสอบรูปแบบของวันที่
    if (isNaN(new Date(date))) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const records = await prisma.foodRecord.findMany({
      where: {
        userId,
        date: new Date(date), // กรองข้อมูลตามวันที่
      },
      orderBy: { time: 'desc' }, // เรียงตามเวลา
    });

    res.status(200).json(records);
  } catch (error) {
    console.error('Error fetching food records by date:', error);
    res.status(500).json({ error: 'Failed to fetch food records by date' });
  }
});

// ลบ Food Record
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // ตรวจสอบว่าค่า ID เป็นตัวเลข
    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid record ID' });
    }

    const record = await prisma.foodRecord.findUnique({
      where: { id: parseInt(id) },
    });

    // ตรวจสอบว่าพบ Record และเป็นของผู้ใช้ปัจจุบัน
    if (!record || record.userId !== userId) {
      return res.status(404).json({ error: 'Food record not found or unauthorized' });
    }

    await prisma.foodRecord.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Food record deleted successfully' });
  } catch (error) {
    console.error('Error deleting food record:', error);
    res.status(500).json({ error: 'Failed to delete food record' });
  }
});

router.get('/weekly-summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const now = new Date();
    const lastMonday = new Date();
    lastMonday.setDate(now.getDate() - (now.getDay() + 6) % 7);

    const records = await prisma.foodRecord.findMany({
      where: {
        userId,
        date: { gte: lastMonday },
      },
    });

    const weeklyCalories = {};

    records.forEach((record) => {
      const day = new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' });

      if (!weeklyCalories[day]) {
        weeklyCalories[day] = { meals: 0, calories: 0 };
      }
      weeklyCalories[day].meals += 1;
      weeklyCalories[day].calories += record.calories;
    });

    res.status(200).json(weeklyCalories);
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    res.status(500).json({ error: 'Failed to fetch weekly summary' });
  }
});

router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, time, date, calories } = req.body;

    if (!name || !time || !date || isNaN(calories)) {
      return res.status(400).json({ message: 'Invalid input data.' });
    }

    const record = await prisma.foodRecord.findUnique({ where: { id: parseInt(id) } });

    if (!record || record.userId !== userId) {
      return res.status(404).json({ error: 'Food record not found or unauthorized' });
    }

    const [hour, minute, period] = time.split(/[: ]/); // แยกชั่วโมง, นาที, AM/PM
    const hour24 = period === 'PM' && hour !== '12' ? parseInt(hour) + 12 : (period === 'AM' && hour === '12' ? 0 : parseInt(hour));
    const formattedTime = `${date}T${hour24.toString().padStart(2, '0')}:${minute}:00`;

    const updatedRecord = await prisma.foodRecord.update({
      where: { id: parseInt(id) },
      data: {
        name: name.trim(),
        time: new Date(formattedTime), 
        date: new Date(date),
        calories: parseInt(calories),
      },
    });

    res.status(200).json({ message: 'Food record updated successfully', record: updatedRecord });
  } catch (error) {
    console.error('Error updating food record:', error);
    res.status(500).json({ error: 'Failed to update food record' });
  }
});


module.exports = router;
