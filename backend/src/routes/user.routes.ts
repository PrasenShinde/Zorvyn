import { Router } from 'express';
import { getUsers } from '../controllers/user.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

router.get('/users', authenticate, authorize([Role.ADMIN]), getUsers);

export default router;
