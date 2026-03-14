import { Router, IRouter } from 'express';
import transactionController from '../controllers/transactionController';

const router: IRouter = Router();

// GET /api/transactions?nature=CREDIT&category=RECORD_AMOUNT
router.get('/', transactionController.getAll.bind(transactionController));

// GET /api/transactions/summary
router.get('/summary', transactionController.getSummary.bind(transactionController));

// GET /api/transactions/balance/:userId
router.get('/balance/:userId', transactionController.getPartnerBalance.bind(transactionController));

// POST /api/transactions (manual entry, e.g. RECORD_AMOUNT)
router.post('/', transactionController.create.bind(transactionController));

// GET /api/transactions/:id
router.get('/:id', transactionController.getById.bind(transactionController));

export default router;
