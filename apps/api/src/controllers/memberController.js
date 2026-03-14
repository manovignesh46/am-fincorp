const memberService = require('../services/memberService');

class MemberController {
  async create(req, res) {
    try {
      const member = await memberService.createMember(req.body);
      res.status(201).json({
        success: true,
        data: member
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
      const members = await memberService.getAllMembers();
      res.status(200).json({
        success: true,
        data: members
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
      const member = await memberService.getMemberById(req.params.id);
      res.status(200).json({
        success: true,
        data: member
      });
    } catch (error) {
      const statusCode = error.message === 'Member not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async update(req, res) {
    try {
      const member = await memberService.updateMember(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: member
      });
    } catch (error) {
      const statusCode = error.message === 'Member not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async delete(req, res) {
    try {
      await memberService.deleteMember(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Member deleted successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Member not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new MemberController();
