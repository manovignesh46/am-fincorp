import { Request, Response } from 'express';
import transactionService from '../services/transactionService';

class TransactionController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const filters = {
        nature: req.query.nature as string | undefined,
        category: req.query.category as string | undefined,
        userId: req.query.userId as string | undefined,
        search: (req.query.search as string) || undefined,
        page,
        limit,
      };
      const { rows, count } = await transactionService.getAll(filters);
      res.status(200).json({
        success: true,
        data: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      // userId is attached to req.user by the auth middleware
      const transaction = await transactionService.create(req.body, req.user!.id);
      res.status(201).json({ success: true, data: transaction });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  async getSummary(_req: Request, res: Response): Promise<void> {
    try {
      const summary = await transactionService.getSummary();
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async getPartnerBalance(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId || req.user!.id;
      const balance = await transactionService.getPartnerBalance(userId);
      res.status(200).json({ success: true, data: balance });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const transaction = await transactionService.getById(req.params.id);
      res.status(200).json({ success: true, data: transaction });
    } catch (error) {
      const statusCode = (error as Error).message === 'Transaction not found' ? 404 : 500;
      res.status(statusCode).json({ success: false, message: (error as Error).message });
    }
  }
}

export default new TransactionController();
