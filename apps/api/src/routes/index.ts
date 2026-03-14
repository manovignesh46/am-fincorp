import { Router, IRouter } from 'express';
import authenticate from '../middleware/auth';
import authRoutes from './authRoutes';
import memberRoutes from './memberRoutes';
import chitFundRoutes from './chitFundRoutes';
import chitFundTemplateRoutes from './chitFundTemplateRoutes';
import transactionRoutes from './transactionRoutes';

const router: IRouter = Router();

// ─── Public routes ────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ─── Protected routes (Bearer token required) ─────────────────────────────────
router.use(authenticate);

router.use('/members', memberRoutes);
router.use('/chit-funds', chitFundRoutes);
router.use('/chit-fund-templates', chitFundTemplateRoutes);
router.use('/transactions', transactionRoutes);

export default router;
