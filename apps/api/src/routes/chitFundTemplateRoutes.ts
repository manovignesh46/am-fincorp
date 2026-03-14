import { Router, IRouter } from 'express';
import chitFundTemplateController from '../controllers/chitFundTemplateController';

const router: IRouter = Router();

router.post('/', chitFundTemplateController.create.bind(chitFundTemplateController));
router.get('/', chitFundTemplateController.getAll.bind(chitFundTemplateController));
router.get('/:id', chitFundTemplateController.getById.bind(chitFundTemplateController));
router.put('/:id', chitFundTemplateController.update.bind(chitFundTemplateController));
router.delete('/:id', chitFundTemplateController.delete.bind(chitFundTemplateController));

export default router;
