require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  initialUsers: {
    superAdmin: {
      name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD,
      role: 'SUPER_ADMIN',
    },
    partners: [
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
    ],
  },
};

module.exports = config;
