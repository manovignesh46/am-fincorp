import { Router, IRouter } from 'express';
import chitFundController from '../controllers/chitFundController';

const router: IRouter = Router();

// CREATE a new Chit Fund
router.post('/', chitFundController.create.bind(chitFundController));

// GET all Chit Funds
router.get('/', chitFundController.getAll.bind(chitFundController));

// GET a specific Chit Fund by ID
router.get('/:id', chitFundController.getById.bind(chitFundController));

// UPDATE a Chit Fund by ID
router.put('/:id', chitFundController.update.bind(chitFundController));

// DELETE a Chit Fund by ID (Soft delete)
router.delete('/:id', chitFundController.delete.bind(chitFundController));

// ── Enrollment routes ──────────────────────────────────────────────────────────

// GET enrolled members for a chit fund
router.get('/:id/members', chitFundController.getEnrollments.bind(chitFundController));

// ADD a member to a chit fund
router.post('/:id/members', chitFundController.addMember.bind(chitFundController));

// REMOVE a member (enrollment) from a chit fund
router.delete('/:id/members/:enrollmentId', chitFundController.removeEnrollment.bind(chitFundController));

export default router;
