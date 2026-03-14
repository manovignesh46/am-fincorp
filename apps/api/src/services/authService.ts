import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@am-fincorp/database';
import config from '../config';

interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LoginResult {
  user: UserResponse;
  token: string;
}

class AuthService {
  async login(email: string, password: string): Promise<LoginResult> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const user = (await User.findOne({ where: { email, isActive: true } })) as any;
      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        config.auth.jwtSecret,
        { expiresIn: config.auth.jwtExpiresIn as any }
      );

      const userResponse: UserResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      return { user: userResponse, token };
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as { id: number };
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      });

      if (!user || !(user as any).isActive) {
        throw new Error('User not found or inactive');
      }

      return user;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error('Invalid or expired token');
    }
  }
}

export default new AuthService();
