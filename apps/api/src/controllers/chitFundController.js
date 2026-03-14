const chitFundService = require('../services/chitFundService');

class ChitFundController {
  async create(req, res) {
    try {
      const chitFund = await chitFundService.createChitFund(req.body);
      res.status(201).json({
        success: true,
        data: chitFund
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAll(req, res) {
    try {
      const chitFunds = await chitFundService.getAllChitFunds();
      res.status(200).json({
        success: true,
        data: chitFunds
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getById(req, res) {
    try {
      const chitFund = await chitFundService.getChitFundById(req.params.id);
      res.status(200).json({
        success: true,
        data: chitFund
      });
    } catch (error) {
      const statusCode = error.message === 'Chit Fund not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const chitFund = await chitFundService.updateChitFund(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: chitFund
      });
    } catch (error) {
      const statusCode = error.message === 'Chit Fund not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      await chitFundService.deleteChitFund(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Chit Fund deleted successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Chit Fund not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ChitFundController();
