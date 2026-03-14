const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/auth');

const authRoutes = require('./authRoutes');
const memberRoutes = require('./memberRoutes');
const chitFundRoutes = require('./chitFundRoutes');

// ─── Public routes ────────────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ─── Protected routes (Bearer token required) ─────────────────────────────────
router.use(authenticate);

router.use('/members', memberRoutes);
router.use('/chit-funds', chitFundRoutes);

module.exports = router;
