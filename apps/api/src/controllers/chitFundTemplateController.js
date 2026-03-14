const chitFundTemplateService = require('../services/chitFundTemplateService');

class ChitFundTemplateController {
  async create(req, res) {
    try {
      const template = await chitFundTemplateService.createTemplate(req.body);
      res.status(201).json({ success: true, data: template });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const templates = await chitFundTemplateService.getAllTemplates();
      res.status(200).json({ success: true, data: templates });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const template = await chitFundTemplateService.getTemplateById(req.params.id);
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      const statusCode = error.message === 'Template not found' ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const template = await chitFundTemplateService.updateTemplate(req.params.id, req.body);
      res.status(200).json({ success: true, data: template });
    } catch (error) {
      const statusCode = error.message === 'Template not found' ? 404 : 400;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await chitFundTemplateService.deleteTemplate(req.params.id);
      res.status(200).json({ success: true, message: 'Template deleted successfully' });
    } catch (error) {
      const statusCode = error.message === 'Template not found' ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ChitFundTemplateController();
