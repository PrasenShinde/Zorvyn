import { Router } from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { loginBodySchema, registerBodySchema } from '../schemas/auth.schemas.js';
import { authRateLimiter } from '../middlewares/rate-limit.middleware.js';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerBodySchema), register);
router.post('/login', authRateLimiter, validateBody(loginBodySchema), login);

export default router;
