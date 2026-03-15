require('dotenv').config({ path: require('path').resolve(__dirname, '../../apps/api/.env') });
const { sequelize } = require('../index');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected.');

    await sequelize.query(`
      ALTER TABLE "ChitFunds" DROP COLUMN IF EXISTS "monthlyContribution";
    `);

    console.log('✅ Column "monthlyContribution" dropped from "ChitFunds".');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
