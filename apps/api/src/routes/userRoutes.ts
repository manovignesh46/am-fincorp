import { Router, IRouter, Request, Response } from 'express';
import { User } from '@am-fincorp/database';

const router: IRouter = Router();

// GET /api/users — list all active partners (for To Partner dropdown)
router.get('/', async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user!.id;
    const users = await (User as any).findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'email', 'role'],
      order: [['name', 'ASC']],
    });
    // Exclude the requesting user so they can't transfer to themselves
    const partners = (users as any[]).filter((u: any) => u.id !== currentUserId);
    res.status(200).json({ success: true, data: partners });
  } catch (error) {
    res.status(500).json({ success: false, message: (error as Error).message });
  }
});

export default router;
