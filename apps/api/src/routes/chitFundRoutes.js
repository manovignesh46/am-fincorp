const express = require('express');
const router = express.Router();
const chitFundController = require('../controllers/chitFundController');

// CREATE a new Chit Fund
router.post('/', chitFundController.create);

// GET all Chit Funds
router.get('/', chitFundController.getAll);

// GET a specific Chit Fund by ID
router.get('/:id', chitFundController.getById);

// UPDATE a Chit Fund by ID
router.put('/:id', chitFundController.update);

// DELETE a Chit Fund by ID (Soft delete)
router.delete('/:id', chitFundController.delete);

module.exports = router;
