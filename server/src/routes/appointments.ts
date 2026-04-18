import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as appointmentController from '../controllers/appointmentController';
import { authenticate } from '../middleware/auth';
import {
  AppointmentCreateSchema,
  AppointmentUpdateSchema,
  AppointmentCancelSchema,
} from '../schemas/appointmentSchema';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware factory - use ZodType for compatibility
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
router.get('/', appointmentController.getAppointments);
router.get('/today', appointmentController.getTodayAppointments);
router.get('/:id', appointmentController.getAppointment);
router.post('/', validateBody(AppointmentCreateSchema), appointmentController.createAppointment);
router.put('/:id', validateBody(AppointmentUpdateSchema), appointmentController.updateAppointment);
router.delete('/:id', (req: Request, res: Response, next: NextFunction): void => {
  const result = AppointmentCancelSchema.safeParse(req.body);
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
}, appointmentController.deleteAppointment);
router.post('/:id/complete', appointmentController.completeAppointment);
router.post('/:id/confirm', appointmentController.confirmAppointment);

export default router;