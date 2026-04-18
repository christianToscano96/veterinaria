import { Request, Response } from 'express';
import * as vaccinationService from '../services/vaccinationService';
import {
  VaccinationCreateSchema,
  VaccinationUpdateSchema,
  UpcomingQuerySchema,
} from '../schemas/vaccinationSchema';
import type { VaccinationStatus } from '../services/vaccinationService';

// Standard response format (duplicated from auth for independence)
const successResponse = (res: Response, data: unknown, status = 200) => {
  res.status(status).json({
    success: true,
    data,
  });
};

const errorResponse = (
  res: Response,
  message: string,
  code: string = 'INTERNAL_ERROR',
  status = 500,
  details?: unknown
) => {
  res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
};

// Helper to transform vaccination with status
const transformVaccination = (vaccination: unknown) => {
  const obj = vaccination as Record<string, unknown>;
  obj.id = obj._id;
  delete obj._id;
  
  // Calculate status
  const status = vaccinationService.calculateVaccinationStatus(
    obj.nextDueDate as Date | null | undefined
  );
  obj.status = status;
  
  return obj;
};

// Get vaccinations by animal ID
export const getVaccinationsByAnimal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { animalId } = req.params;

    if (!animalId) {
      errorResponse(res, 'Animal ID is required', 'VALIDATION_ERROR', 400);
      return;
    }

    const vaccinations = await vaccinationService.getAllForAnimal(animalId);

    // Transform each vaccination with status
    const vaccinationsResponse = vaccinations.map((v) => {
      const obj = v as Record<string, unknown>;
      return transformVaccination(obj);
    });

    successResponse(res, vaccinationsResponse);
  } catch (error) {
    console.error('GetVaccinationsByAnimal error:', error);
    if (error instanceof Error && error.message.includes('Invalid animal ID')) {
      errorResponse(res, 'Invalid animal ID', 'INVALID_ID', 400);
      return;
    }
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Get upcoming vaccinations
export const getUpcomingVaccinations = async (req: Request, res: Response): Promise<void> => {
  try {
    const queryResult = UpcomingQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      errorResponse(res, 'Invalid query parameters', 'VALIDATION_ERROR', 400, queryResult.error.issues);
      return;
    }

    const { days } = queryResult.data;
    const vaccinations = await vaccinationService.getUpcoming(days);

    // Transform each vaccination with status
    const vaccinationsResponse = vaccinations.map((v) => {
      const obj = v as Record<string, unknown>;
      return transformVaccination(obj);
    });

    successResponse(res, vaccinationsResponse);
  } catch (error) {
    console.error('GetUpcomingVaccinations error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Get overdue vaccinations
export const getOverdueVaccinations = async (req: Request, res: Response): Promise<void> => {
  try {
    const vaccinations = await vaccinationService.getOverdue();

    // Transform each vaccination with status
    const vaccinationsResponse = vaccinations.map((v) => {
      const obj = v as Record<string, unknown>;
      return transformVaccination(obj);
    });

    successResponse(res, vaccinationsResponse);
  } catch (error) {
    console.error('GetOverdueVaccinations error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Create vaccination
export const createVaccination = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = VaccinationCreateSchema.safeParse(req.body);

    if (!result.success) {
      errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, result.error.issues);
      return;
    }

    const vaccination = await vaccinationService.create(result.data);

    // Fetch the created vaccination with populated fields
    const created = await vaccinationService.getById(vaccination.id as string);
    
    if (!created) {
      errorResponse(res, 'Failed to create vaccination', 'INTERNAL_ERROR', 500);
      return;
    }

    const obj = created as Record<string, unknown>;
    const response = transformVaccination(obj);

    successResponse(res, response, 201);
  } catch (error) {
    console.error('CreateVaccination error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Update vaccination
export const updateVaccination = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = VaccinationUpdateSchema.safeParse(req.body);

    if (!result.success) {
      errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, result.error.issues);
      return;
    }

    const vaccination = await vaccinationService.update(id, result.data);

    if (!vaccination) {
      errorResponse(res, 'Vaccination not found', 'VACCINATION_NOT_FOUND', 404);
      return;
    }

    const obj = vaccination as Record<string, unknown>;
    const response = transformVaccination(obj);

    successResponse(res, response);
  } catch (error) {
    console.error('UpdateVaccination error:', error);
    if (error instanceof Error && error.message.includes('ObjectId')) {
      errorResponse(res, 'Invalid vaccination ID', 'INVALID_ID', 400);
      return;
    }
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Delete vaccination
export const deleteVaccination = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await vaccinationService.remove(id);

    if (!deleted) {
      errorResponse(res, 'Vaccination not found', 'VACCINATION_NOT_FOUND', 404);
      return;
    }

    successResponse(res, { message: 'Vaccination deleted successfully' });
  } catch (error) {
    console.error('DeleteVaccination error:', error);
    if (error instanceof Error && error.message.includes('ObjectId')) {
      errorResponse(res, 'Invalid vaccination ID', 'INVALID_ID', 400);
      return;
    }
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Mark reminder as sent
export const markReminderSent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const vaccination = await vaccinationService.markReminderSent(id);

    if (!vaccination) {
      errorResponse(res, 'Vaccination not found', 'VACCINATION_NOT_FOUND', 404);
      return;
    }

    const obj = vaccination as Record<string, unknown>;
    const response = transformVaccination(obj);

    successResponse(res, response);
  } catch (error) {
    console.error('MarkReminderSent error:', error);
    if (error instanceof Error && error.message.includes('ObjectId')) {
      errorResponse(res, 'Invalid vaccination ID', 'INVALID_ID', 400);
      return;
    }
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

export default {
  getVaccinationsByAnimal,
  getUpcomingVaccinations,
  getOverdueVaccinations,
  createVaccination,
  updateVaccination,
  deleteVaccination,
  markReminderSent,
};