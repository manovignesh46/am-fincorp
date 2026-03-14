import { Request, Response } from 'express';
import chitFundService from '../services/chitFundService';

class ChitFundController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const chitFund = await chitFundService.createChitFund(req.body);
      res.status(201).json({
        success: true,
        data: chitFund,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const chitFunds = await chitFundService.getAllChitFunds();
      res.status(200).json({
        success: true,
        data: chitFunds,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const chitFund = await chitFundService.getChitFundById(req.params.id);
      res.status(200).json({
        success: true,
        data: chitFund,
      });
    } catch (error) {
      const statusCode = (error as Error).message === 'Chit Fund not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const chitFund = await chitFundService.updateChitFund(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: chitFund,
      });
    } catch (error) {
      const statusCode = (error as Error).message === 'Chit Fund not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await chitFundService.deleteChitFund(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Chit Fund deleted successfully',
      });
    } catch (error) {
      const statusCode = (error as Error).message === 'Chit Fund not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}

export default new ChitFundController();
