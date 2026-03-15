import { Op } from '@am-fincorp/database';
import { ChitFundTemplate } from '@am-fincorp/database';

export interface TemplateListParams {
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  rows: T[];
  count: number;
}

class ChitFundTemplateService {
  async createTemplate(data: Record<string, unknown>): Promise<any> {
    try {
      return await ChitFundTemplate.create(data);
    } catch (error) {
      console.error('Error creating ChitFund Template:', error);
      throw new Error('Could not create template: ' + (error as Error).message);
    }
  }

  async getAllTemplates(params: TemplateListParams = {}): Promise<PaginatedResult<any>> {
    try {
      const { search, page = 1, limit = 10, orderBy = 'createdAt', orderDir = 'DESC' } = params;
      const where: Record<string, unknown> = {};
      if (search) {
        where[Op.or as unknown as string] = [
          { name: { [Op.iLike]: `%${search}%` } },
        ];
      }
      const safePage = Math.max(1, page);
      const safeLimit = Math.min(100, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const result = await (ChitFundTemplate as any).findAndCountAll({
        where,
        order: [[orderBy, orderDir]],
        limit: safeLimit,
        offset,
      });
      return { rows: result.rows, count: result.count };
    } catch (error) {
      console.error('Error fetching ChitFund Templates:', error);
      throw new Error('Could not fetch templates');
    }
  }

  async getTemplateById(id: string): Promise<any> {
    try {
      const template = await ChitFundTemplate.findByPk(id);
      if (!template) throw new Error('Template not found');
      return template;
    } catch (error) {
      console.error(`Error fetching ChitFund Template ${id}:`, error);
      throw error;
    }
  }

  async updateTemplate(id: string, data: Record<string, unknown>): Promise<any> {
    try {
      const template = (await ChitFundTemplate.findByPk(id)) as any;
      if (!template) throw new Error('Template not found');
      await template.update(data);
      return template;
    } catch (error) {
      console.error(`Error updating ChitFund Template ${id}:`, error);
      throw error;
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      const template = (await ChitFundTemplate.findByPk(id)) as any;
      if (!template) throw new Error('Template not found');
      await template.destroy();
    } catch (error) {
      console.error(`Error deleting ChitFund Template ${id}:`, error);
      throw error;
    }
  }
}

export default new ChitFundTemplateService();
