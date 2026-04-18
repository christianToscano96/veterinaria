import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Dashboard routes
router.get('/stats', dashboardController.getStats);
router.get('/appointments/today', dashboardController.getTodayAppointments);
router.get('/vaccinations/upcoming', dashboardController.getUpcomingVaccinations);
router.get('/vaccinations/overdue', dashboardController.getOverdueVaccinations);
router.get('/recent-activity', dashboardController.getRecentActivity);

export default router;