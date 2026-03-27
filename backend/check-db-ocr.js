const CustomerId = require('./models/CustomerId');
const sequelize = require('./config/database');

async function check() {
  try {
    const data = await CustomerId.findAll();
    console.log('Customer IDs:', JSON.stringify(data, null, 2));
    await sequelize.close();
  } catch (err) {
    console.error('Error querying DB:', err);
    process.exit(1);
  }
}

check();
