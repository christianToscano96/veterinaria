import { Router, Request, Response, NextFunction } from 'express';
import * as socialPostController from '../controllers/socialPostController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// CRUD routes
router.get('/', socialPostController.getSocialPosts);
router.get('/:id', socialPostController.getSocialPostById);
router.post('/', socialPostController.createSocialPost);
router.put('/:id', socialPostController.updateSocialPost);
router.delete('/:id', socialPostController.deleteSocialPost);

// Action routes
router.post('/:id/schedule', socialPostController.scheduleSocialPost);
router.post('/:id/publish', socialPostController.publishSocialPost);

export default router;