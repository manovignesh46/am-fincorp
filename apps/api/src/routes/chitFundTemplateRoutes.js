const express = require('express');
const router = express.Router();
const chitFundTemplateController = require('../controllers/chitFundTemplateController');

router.post('/', chitFundTemplateController.create);
router.get('/', chitFundTemplateController.getAll);
router.get('/:id', chitFundTemplateController.getById);
router.put('/:id', chitFundTemplateController.update);
router.delete('/:id', chitFundTemplateController.delete);

module.exports = router;
