const path = require('path');
// Load environment variables from apps/api/.env specifically for this script
require('dotenv').config({ path: path.resolve(__dirname, '../../../apps/api/.env') });

const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../index');

async function seedUsers() {
  try {
    console.log('Starting user seeding...');
    await sequelize.authenticate();
    console.log('Database connection OK.');
    await sequelize.sync({ alter: false });
    console.log('Database tables synced.');

    const usersToSeed = [
      {
        name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
        role: 'SUPER_ADMIN',
      },
      {
        name: process.env.MANO_NAME || 'Mano',
        email: process.env.MANO_EMAIL,
        password: process.env.MANO_PASSWORD,
        role: 'PARTNER',
      },
      {
        name: process.env.ARUL_NAME || 'Arul',
        email: process.env.ARUL_EMAIL,
        password: process.env.ARUL_PASSWORD,
        role: 'PARTNER',
      },
    ];

    for (const userData of usersToSeed) {
      if (!userData.email || !userData.password) {
        console.warn(`Skipping user ${userData.name}: Missing email or password in configuration.`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const [user, created] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          name: userData.name,
          password: hashedPassword,
          role: userData.role,
          isActive: true
        }
      });

      if (created) {
        console.log(`Created user: ${userData.name} (${userData.role})`);
      } else {
        console.log(`User already exists: ${userData.name} (${userData.role})`);
      }
    }

    console.log('User seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
