const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// CREATE a new Member
router.post('/', memberController.create);

// GET all Members
router.get('/', memberController.getAll);

// GET a specific Member by ID
router.get('/:id', memberController.getById);

// UPDATE a Member by ID
router.put('/:id', memberController.update);

// DELETE a Member by ID
router.delete('/:id', memberController.delete);

module.exports = router;
