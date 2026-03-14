import { Router, IRouter } from 'express';
import memberController from '../controllers/memberController';

const router: IRouter = Router();

// CREATE a new Member
router.post('/', memberController.create.bind(memberController));

// GET all Members
router.get('/', memberController.getAll.bind(memberController));

// GET a specific Member by ID
router.get('/:id', memberController.getById.bind(memberController));

// UPDATE a Member by ID
router.put('/:id', memberController.update.bind(memberController));

// DELETE a Member by ID
router.delete('/:id', memberController.delete.bind(memberController));

export default router;
