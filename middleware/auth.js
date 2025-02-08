const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // ตรวจสอบว่า Authorization Header มีค่าหรือไม่ และมีรูปแบบที่ถูกต้อง
    console.log('Authorization Header:', authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('Unauthorized access attempt: Missing or invalid Authorization header');
        return res.status(401).json({ message: 'Unauthorized: Invalid Authorization header format' });
    }

    const token = authHeader.split(' ')[1]; // ดึงโทเค็นออกจาก "Bearer <token>"
    console.log('Token:', token);
    if (!token) {
        console.warn('Unauthorized access attempt: Token is missing');
        return res.status(401).json({ message: 'Unauthorized: Token is missing' });
    }

    try {
        // ตรวจสอบว่า JWT_SECRET ถูกกำหนดใน environment variables หรือไม่
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        if (!process.env.JWT_SECRET) {
            console.error('Critical error: JWT_SECRET is not defined in environment variables');
            return res.status(500).json({ message: 'Internal Server Error: Missing JWT_SECRET' });
        }

        // ตรวจสอบความถูกต้องของโทเค็น
        console.log('JWT_SECRET used for verifying token:', process.env.JWT_SECRET);
        console.log('Token being verified:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // เก็บข้อมูลผู้ใช้ลงใน req.user
        console.info(`Token validated successfully for user: ${decoded.userId}`);
        next(); // อนุญาตให้ดำเนินการต่อ
    } catch (err) {
        // จัดการข้อผิดพลาดของโทเค็น
        console.error('Token verification failed:', err.message);
        if (err.name === 'TokenExpiredError') {
            console.warn('Unauthorized access attempt: Token has expired');
            return res.status(401).json({ message: 'Unauthorized: Token has expired' });
        } else if (err.name === 'JsonWebTokenError') {
            console.warn('Unauthorized access attempt: Invalid token');
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        } else {
            console.error('Unexpected error in auth middleware:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }
    }

};
