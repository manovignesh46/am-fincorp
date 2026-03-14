import { Router, IRouter } from 'express';
import authController from '../controllers/authController';

const router: IRouter = Router();

// POST /api/auth/login
router.post('/login', authController.login.bind(authController));

// GET /api/auth/verify (Token verification)
router.get('/verify', authController.verify.bind(authController));

export default router;
