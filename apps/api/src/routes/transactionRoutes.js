const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// GET /api/transactions?nature=CREDIT&category=RECORD_AMOUNT
router.get('/', transactionController.getAll);

// GET /api/transactions/summary
router.get('/summary', transactionController.getSummary);

// GET /api/transactions/balance/:userId
router.get('/balance/:userId', transactionController.getPartnerBalance);

// POST /api/transactions  (manual entry, e.g. RECORD_AMOUNT)
router.post('/', transactionController.create);

// GET /api/transactions/:id
router.get('/:id', transactionController.getById);

module.exports = router;
