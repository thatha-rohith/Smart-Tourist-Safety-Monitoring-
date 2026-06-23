require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const touristRoutes = require('./routes/tourists');
const alertRoutes = require('./routes/alerts');
const zoneRoutes = require('./routes/zones');
const efirRoutes = require('./routes/efirs');
const broadcastRoutes = require('./routes/broadcasts');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Tourist Safety Monitoring System API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tourists', touristRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/efirs', efirRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
