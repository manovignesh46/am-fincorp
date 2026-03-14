const transactionService = require('../services/transactionService');

class TransactionController {
  async getAll(req, res) {
    try {
      const filters = {
        nature: req.query.nature,
        category: req.query.category,
        userId: req.query.userId,
      };
      const transactions = await transactionService.getAll(filters);
      res.status(200).json({ success: true, data: transactions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      // userId is attached to req.user by the auth middleware
      const transaction = await transactionService.create(req.body, req.user.id);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getSummary(req, res) {
    try {
      const summary = await transactionService.getSummary();
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPartnerBalance(req, res) {
    try {
      const userId = req.params.userId || req.user.id;
      const balance = await transactionService.getPartnerBalance(userId);
      res.status(200).json({ success: true, data: balance });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const transaction = await transactionService.getById(req.params.id);
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      const statusCode = error.message === 'Transaction not found' ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TransactionController();
