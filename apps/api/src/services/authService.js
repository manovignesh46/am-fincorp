const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('@am-fincorp/database');
const config = require('../config');

class AuthService {
  /**
   * Login user and return JWT
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const user = await User.findOne({ where: { email, isActive: true } });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.auth.jwtSecret,
        { expiresIn: config.auth.jwtExpiresIn }
      );

      // Return user info (except password) and token
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      return { user: userResponse, token };
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  }

  /**
   * Verify JWT and return user
   * @param {string} token 
   * @returns {Promise<Object>}
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      return user;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error('Invalid or expired token');
    }
  }
}

module.exports = new AuthService();
