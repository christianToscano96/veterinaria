import { Router } from 'express';
import * as authController from '../controllers/auth';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// Public routes (register is protected by x-admin-key header in controller)
router.post('/login', authController.login);
router.post('/register', authController.register);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);
router.post('/refresh', authenticate, authController.refresh);
router.post('/logout', authenticate, authController.logout);

export default router;