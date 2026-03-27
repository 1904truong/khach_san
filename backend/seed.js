const sequelize = require('./config/database');
const User = require('./models/User');
const Room = require('./models/Room');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    
    // Create Admin
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create Sample Rooms
    await Room.bulkCreate([
      { room_number: '101', room_type: 'Deluxe', price_per_hour: 25.0, price_per_day: 150.0 },
      { room_number: '102', room_type: 'Standard', price_per_hour: 15.0, price_per_day: 100.0 },
      { room_number: '201', room_type: 'Suite', price_per_hour: 50.0, price_per_day: 350.0 },
      { room_number: '202', room_type: 'Deluxe', price_per_hour: 25.0, price_per_day: 150.0 },
      { room_number: '301', room_type: 'Presidential', price_per_hour: 100.0, price_per_day: 800.0 },
    ]);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
