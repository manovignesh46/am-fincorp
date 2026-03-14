const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/verify (Token verification)
router.get('/verify', authController.verify);

module.exports = router;
