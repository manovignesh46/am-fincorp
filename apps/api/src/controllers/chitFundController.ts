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

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const search = (req.query.search as string) || undefined;
      const orderBy = (req.query.orderBy as string) || 'createdAt';
      const orderDir = ((req.query.orderDir as string) || 'DESC').toUpperCase() as 'ASC' | 'DESC';

      const { rows, count } = await chitFundService.getAllChitFunds({ search, page, limit, orderBy, orderDir });
      res.status(200).json({
        success: true,
        data: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
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

  async getEnrollments(req: Request, res: Response): Promise<void> {
    try {
      const enrollments = await chitFundService.getEnrollments(req.params.id);
      res.status(200).json({ success: true, data: enrollments });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async addMember(req: Request, res: Response): Promise<void> {
    try {
      const { memberId, memberIds } = req.body;

      // Bulk path: array of memberIds
      if (Array.isArray(memberIds) && memberIds.length > 0) {
        const { enrolled, skipped } = await chitFundService.addMembers(
          req.params.id,
          memberIds.map(String),
        );
        res.status(201).json({ success: true, data: enrolled, skipped });
        return;
      }

      // Single path: legacy / ticket-number support
      if (!memberId) {
        res.status(400).json({ success: false, message: 'memberId or memberIds is required' });
        return;
      }
      const { ticketNumber } = req.body;
      const enrollment = await chitFundService.addMember(req.params.id, String(memberId), ticketNumber);
      res.status(201).json({ success: true, data: enrollment });
    } catch (error) {
      const msg = (error as Error).message;
      const status = msg.includes('already enrolled') ? 409 : 400;
      res.status(status).json({ success: false, message: msg });
    }
  }

  async removeEnrollment(req: Request, res: Response): Promise<void> {
    try {
      await chitFundService.removeEnrollment(req.params.id, req.params.enrollmentId);
      res.status(200).json({ success: true, message: 'Member removed from chit fund' });
    } catch (error) {
      const status = (error as Error).message === 'Enrollment not found' ? 404 : 500;
      res.status(status).json({ success: false, message: (error as Error).message });
    }
  }

  async getContributions(req: Request, res: Response): Promise<void> {
    try {
      const data = await chitFundService.getContributions(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async recordContribution(req: Request, res: Response): Promise<void> {
    try {
      const { enrollmentId, month, amount, paidDate, note } = req.body;
      if (!enrollmentId || !month || !amount) {
        res.status(400).json({ success: false, message: 'enrollmentId, month, and amount are required' });
        return;
      }
      const data = await chitFundService.recordContribution(
        req.params.id,
        { enrollmentId: Number(enrollmentId), month: Number(month), amount: Number(amount), paidDate, note },
        req.user!.id
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  async deleteContribution(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      await chitFundService.deleteContribution(req.params.id, req.params.contributionId, userId);
      res.status(200).json({ success: true, message: 'Contribution deleted' });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  async getAuctions(req: Request, res: Response): Promise<void> {
    try {
      const data = await chitFundService.getAuctions(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  async recordAuction(req: Request, res: Response): Promise<void> {
    try {
      const { winnerEnrollmentId, auctionMonth, payoutAmount, auctionDate, note } = req.body;
      if (!winnerEnrollmentId || !auctionMonth || !payoutAmount) {
        res.status(400).json({ success: false, message: 'winnerEnrollmentId, auctionMonth, and payoutAmount are required' });
        return;
      }
      const data = await chitFundService.recordAuction(
        req.params.id,
        {
          winnerEnrollmentId: Number(winnerEnrollmentId),
          auctionMonth: Number(auctionMonth),
          payoutAmount: Number(payoutAmount),
          auctionDate,
          note,
        },
        req.user!.id
      );
      res.status(201).json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }
}

export default new ChitFundController();
