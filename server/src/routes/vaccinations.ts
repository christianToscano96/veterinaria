import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as vaccinationController from '../controllers/vaccinationController';
import { authenticate } from '../middleware/auth';
import { VaccinationCreateSchema, VaccinationUpdateSchema } from '../schemas/vaccinationSchema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware factory
const validateBody = <T>(schema: z.ZodType<T>) => {
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
router.get('/animal/:animalId', vaccinationController.getVaccinationsByAnimal);
router.get('/upcoming', vaccinationController.getUpcomingVaccinations);
router.get('/overdue', vaccinationController.getOverdueVaccinations);
router.post('/', validateBody(VaccinationCreateSchema), vaccinationController.createVaccination);
router.put('/:id', validateBody(VaccinationUpdateSchema), vaccinationController.updateVaccination);
router.delete('/:id', vaccinationController.deleteVaccination);
router.post('/:id/mark-reminder-sent', vaccinationController.markReminderSent);

export default router;