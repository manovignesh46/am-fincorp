const { ChitFundTemplate } = require('@am-fincorp/database');

class ChitFundTemplateService {
  /**
   * Create a new Chit Fund Template
   * @param {Object} data
   * @returns {Promise<ChitFundTemplate>}
   */
  async createTemplate(data) {
    try {
      return await ChitFundTemplate.create(data);
    } catch (error) {
      console.error('Error creating ChitFund Template:', error);
      throw new Error('Could not create template: ' + error.message);
    }
  }

  /**
   * Get all Chit Fund Templates
   * @returns {Promise<Array>}
   */
  async getAllTemplates() {
    try {
      return await ChitFundTemplate.findAll({ order: [['createdAt', 'DESC']] });
    } catch (error) {
      console.error('Error fetching ChitFund Templates:', error);
      throw new Error('Could not fetch templates');
    }
  }

  /**
   * Get a single Chit Fund Template by ID
   * @param {number} id
   * @returns {Promise<ChitFundTemplate>}
   */
  async getTemplateById(id) {
    try {
      const template = await ChitFundTemplate.findByPk(id);
      if (!template) throw new Error('Template not found');
      return template;
    } catch (error) {
      console.error(`Error fetching ChitFund Template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a Chit Fund Template
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<ChitFundTemplate>}
   */
  async updateTemplate(id, data) {
    try {
      const template = await ChitFundTemplate.findByPk(id);
      if (!template) throw new Error('Template not found');
      await template.update(data);
      return template;
    } catch (error) {
      console.error(`Error updating ChitFund Template ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft-delete a Chit Fund Template
   * @param {number} id
   * @returns {Promise<void>}
   */
  async deleteTemplate(id) {
    try {
      const template = await ChitFundTemplate.findByPk(id);
      if (!template) throw new Error('Template not found');
      await template.destroy();
    } catch (error) {
      console.error(`Error deleting ChitFund Template ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new ChitFundTemplateService();
