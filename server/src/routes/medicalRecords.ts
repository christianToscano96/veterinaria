import { Router, Request, Response, NextFunction } from 'express';
import * as medicalRecordController from '../controllers/medicalRecordController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// CRUD routes
router.get('/animal/:animalId', medicalRecordController.getMedicalRecordsByAnimal);
router.get('/:id', medicalRecordController.getMedicalRecordById);
router.post('/', medicalRecordController.createMedicalRecord);
router.put('/:id', medicalRecordController.updateMedicalRecord);
router.delete('/:id', medicalRecordController.deleteMedicalRecord);

export default router;