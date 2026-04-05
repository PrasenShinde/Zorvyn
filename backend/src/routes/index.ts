import { Router } from 'express';
import authRoutes from './auth.routes.js';
import recordRoutes from './record.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', recordRoutes);

export default router;
