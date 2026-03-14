import { Request, Response } from 'express';
import authService from '../services/authService';

class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const statusCode = (error as Error).message === 'Invalid credentials' ? 401 : 400;
      res.status(statusCode).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async verify(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(401).json({ success: false, message: 'No token provided' });
        return;
      }

      const user = await authService.verifyToken(token);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}

export default new AuthController();
