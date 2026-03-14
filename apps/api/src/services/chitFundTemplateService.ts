import { ChitFundTemplate } from '@am-fincorp/database';

class ChitFundTemplateService {
  async createTemplate(data: Record<string, unknown>): Promise<any> {
    try {
      return await ChitFundTemplate.create(data);
    } catch (error) {
      console.error('Error creating ChitFund Template:', error);
      throw new Error('Could not create template: ' + (error as Error).message);
    }
  }

  async getAllTemplates(): Promise<any[]> {
    try {
      return await ChitFundTemplate.findAll({ order: [['createdAt', 'DESC']] });
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
