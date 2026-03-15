import { Request, Response } from 'express';
import chitFundTemplateService from '../services/chitFundTemplateService';

class ChitFundTemplateController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const template = await chitFundTemplateService.createTemplate(req.body);
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      res.status(400).json({ success: false, message: (error as Error).message });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const search = (req.query.search as string) || undefined;
      const orderBy = (req.query.orderBy as string) || 'createdAt';
      const orderDir = ((req.query.orderDir as string) || 'DESC').toUpperCase() as 'ASC' | 'DESC';

      const { rows, count } = await chitFundTemplateService.getAllTemplates({ search, page, limit, orderBy, orderDir });
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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const template = await chitFundTemplateService.getTemplateById(req.params.id);
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      const statusCode = (error as Error).message === 'Template not found' ? 404 : 500;
      res.status(statusCode).json({ success: false, message: (error as Error).message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const template = await chitFundTemplateService.updateTemplate(req.params.id, req.body);
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      const statusCode = (error as Error).message === 'Template not found' ? 404 : 400;
      res.status(statusCode).json({ success: false, message: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await chitFundTemplateService.deleteTemplate(req.params.id);
      res.status(200).json({ success: true, message: 'Template deleted successfully' });
    } catch (error) {
      const statusCode = (error as Error).message === 'Template not found' ? 404 : 500;
      res.status(statusCode).json({ success: false, message: (error as Error).message });
    }
  }
}

export default new ChitFundTemplateController();
