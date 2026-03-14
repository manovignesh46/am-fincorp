const authService = require('../services/authService');

class AuthController {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      const statusCode = error.message === 'Invalid credentials' ? 401 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async verify(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      const user = await authService.verifyToken(token);
      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new AuthController();
