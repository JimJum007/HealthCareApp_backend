require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');
const foodRecordRoutes = require('./routes/foodRecord');
const cors = require('cors');

const app = express();


app.use(bodyParser.json());


app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Body: ${JSON.stringify(req.body)}`);
  next();
});


if (!process.env.SECRET_KEY) {
  console.error('SECRET_KEY is not defined in environment variables');
  process.exit(1); 
}

const SECRET_KEY = process.env.SECRET_KEY;


const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token format' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Unauthorized: Token has expired' });
    }
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};


app.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Protected data',
    user: req.user,
  });
});


app.use('/food-records', foodRecordRoutes);


app.use('/auth', authRoutes);

const activityRoutes = require('./routes/activityRoutes');
app.use('/activity', activityRoutes);


app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


