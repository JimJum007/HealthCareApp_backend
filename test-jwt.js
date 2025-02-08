const jwt = require('jsonwebtoken');

const secret = 'DontreeMeenProject'; // ใช้ค่าเดียวกับใน .env
const payload = { userId: 2, email: 'jimjum@gmail.com' };

// สร้าง Token
const token = jwt.sign(payload, secret, { expiresIn: '1h' });
console.log('Generated Token:', token);

// ตรวจสอบ Token
try {
  const decoded = jwt.verify(token, secret);
  console.log('Decoded Token:', decoded);
} catch (err) {
  console.error('Error verifying token:', err.message);
}
