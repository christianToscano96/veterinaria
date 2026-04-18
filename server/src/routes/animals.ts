import { Router, Request, Response, NextFunction } from 'express';
import * as animalController from '../controllers/animalController';
import { authenticate } from '../middleware/auth';
import { AnimalCreateSchema, AnimalUpdateSchema } from '../schemas/animalSchema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware factory
const validateBody = (schema: typeof AnimalCreateSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: result.error.issues,
        },
      });
      return;
    }
    req.body = result.data;
    next();
  };
};

// CRUD routes
router.get('/', animalController.getAnimals);
router.get('/:id', animalController.getAnimal);
router.post('/', validateBody(AnimalCreateSchema), animalController.createAnimal);
router.put('/:id', validateBody(AnimalUpdateSchema), animalController.updateAnimal);
router.delete('/:id', animalController.deleteAnimal);

export default router;