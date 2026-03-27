require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models'); // uses models/index.js
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
require('./models/User');
require('./models/Room');
require('./models/Booking');
require('./models/Payment');

const app = express();

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Sync DB and start server
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.sync(); // use { alter: true } in dev if needed
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
})();