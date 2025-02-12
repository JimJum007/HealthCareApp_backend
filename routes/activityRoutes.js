const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { name, startTime, endTime, date } = req.body;

    if (!name || !startTime || !endTime || !date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const userId = req.user.userId;

    // แปลงวันที่ให้ถูกต้อง
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);
    const parsedDate = new Date(`${date}T00:00:00.000Z`); // เพิ่มเวลา 00:00:00

    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime()) || isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format for startTime, endTime, or date' });
    }

    const activity = await prisma.activity.create({
      data: {
        userId,
        name,
        startTime: parsedStartTime.toISOString(),
        endTime: parsedEndTime.toISOString(),
        date: parsedDate.toISOString(), // ต้องเป็น ISO 8601
      },
    });

    res.status(201).json({ message: 'Activity added successfully', activity });
  } catch (error) {
    console.error('Error adding activity:', error);
    res.status(500).json({ message: 'Failed to add activity' });
  }
});



router.get('/by-date/:date', authMiddleware, async (req, res) => {
  try {
      const userId = req.user.userId;
      const { date } = req.params;

      const activities = await prisma.activity.findMany({
          where: {
              userId,
              date: new Date(date),
          },
          orderBy: { startTime: 'desc' },
      });

      res.status(200).json(activities);
  } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ message: 'Failed to fetch activities' });
  }
});

router.get('/by-date/f', async (req, res) => {
  try {
      const userId = req.user.userId;
      const { date } = req.params;

      const activities = await prisma.activity.findMany({
          where: {
              userId,
              date: new Date(date),
          },
          orderBy: { startTime: 'desc' },
      });

      res.status(200).json(activities);
  } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ message: 'Failed to fetch activities' });
  }
});


router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, startTime, endTime, date } = req.body;

    const activity = await prisma.activity.findUnique({ where: { id: parseInt(id) } });

    if (!activity || activity.userId !== userId) {
      return res.status(404).json({ message: 'Activity not found or unauthorized' });
    }

    const updatedActivity = await prisma.activity.update({
      where: { id: parseInt(id) },
      data: { name, startTime, endTime, date: new Date(date) },
    });

    res.status(200).json({ message: 'Activity updated successfully', activity: updatedActivity });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Failed to update activity' });
  }
});

router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const activity = await prisma.activity.findUnique({ where: { id: parseInt(id) } });

    if (!activity || activity.userId !== userId) {
      return res.status(404).json({ message: 'Activity not found or unauthorized' });
    }

    await prisma.activity.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Failed to delete activity' });
  }
});

module.exports = router;
