import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment';
import {
  AppointmentCreateSchema,
  AppointmentUpdateSchema,
  AppointmentQuerySchema,
  AppointmentStatusUpdateSchema,
  AppointmentCancelSchema,
} from '../schemas/appointmentSchema';

// Standard response format
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

// Get all appointments with filters
export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const queryResult = AppointmentQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      errorResponse(res, 'Invalid query parameters', 'VALIDATION_ERROR', 400, queryResult.error.issues);
      return;
    }

    const { page, limit, date, veterinarian, status, animal } = queryResult.data;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter: Record<string, unknown> = {};

    if (date) {
      // Filter by date (start of day to end of day)
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (veterinarian) {
      filter.veterinarian = veterinarian;
    }

    if (status) {
      filter.status = status;
    }

    if (animal) {
      filter.animal = animal;
    }

    // Execute query with pagination
    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(limit)
        .populate('animal', 'name species ownerName ownerPhone')
        .populate('veterinarian', 'name email')
        .lean(),
      Appointment.countDocuments(filter),
    ]);

    // Transform to response format
    const appointmentsResponse = appointments.map((apt) => {
      const obj = { ...apt } as Record<string, unknown>;
      obj.id = obj._id;
      if (obj.animal && typeof obj.animal === 'object' && '_id' in obj.animal) {
        obj.animal = (obj.animal as Record<string, unknown>)._id?.toString();
      }
      if (obj.veterinarian && typeof obj.veterinarian === 'object' && '_id' in obj.veterinarian) {
        obj.veterinarian = (obj.veterinarian as Record<string, unknown>)._id?.toString();
      }
      delete obj._id;
      return obj;
    });

    successResponse(res, {
      appointments: appointmentsResponse,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GetAppointments error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Get today's appointments
export const getTodayAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      date: { $gte: today, $lt: tomorrow },
    })
      .sort({ time: 1 })
      .populate('animal', 'name species ownerName ownerPhone')
      .populate('veterinarian', 'name email')
      .lean();

    const appointmentsResponse = appointments.map((apt) => {
      const obj = { ...apt } as Record<string, unknown>;
      obj.id = obj._id;
      if (obj.animal && typeof obj.animal === 'object' && '_id' in obj.animal) {
        obj.animal = (obj.animal as Record<string, unknown>)._id?.toString();
      }
      if (obj.veterinarian && typeof obj.veterinarian === 'object' && '_id' in obj.veterinarian) {
        obj.veterinarian = (obj.veterinarian as Record<string, unknown>)._id?.toString();
      }
      delete obj._id;
      return obj;
    });

    successResponse(res, appointmentsResponse);
  } catch (error) {
    console.error('GetTodayAppointments error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Get single appointment by ID
export const getAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('animal')
      .populate('veterinarian')
      .populate('createdBy', 'name email')
      .lean();

    if (!appointment) {
      errorResponse(res, 'Appointment not found', 'APPOINTMENT_NOT_FOUND', 404);
      return;
    }

    const appointmentResponse = { ...appointment } as Record<string, unknown>;
    appointmentResponse.id = appointmentResponse._id;
    if (appointmentResponse.animal && typeof appointmentResponse.animal === 'object' && '_id' in appointmentResponse.animal) {
      appointmentResponse.animal = (appointmentResponse.animal as Record<string, unknown>)._id?.toString();
    }
    if (appointmentResponse.veterinarian && typeof appointmentResponse.veterinarian === 'object' && '_id' in appointmentResponse.veterinarian) {
      appointmentResponse.veterinarian = (appointmentResponse.veterinarian as Record<string, unknown>)._id?.toString();
    }
    if (appointmentResponse.createdBy && typeof appointmentResponse.createdBy === 'object' && '_id' in appointmentResponse.createdBy) {
      appointmentResponse.createdBy = (appointmentResponse.createdBy as Record<string, unknown>)._id?.toString();
    }
    delete appointmentResponse._id;

    successResponse(res, appointmentResponse);
  } catch (error) {
    console.error('GetAppointment error:', error);
    if (error instanceof Error && error.message.includes('ObjectId')) {
      errorResponse(res, 'Invalid appointment ID', 'INVALID_ID', 400);
      return;
    }
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Create new appointment with conflict detection
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = AppointmentCreateSchema.safeParse(req.body);

    if (!result.success) {
      errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, result.error.issues);
      return;
    }

    const { animal, date, time } = result.data;

    // Convert date to proper Date object for comparison
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Conflict detection: check if same animal has appointment at same date/time
    const existingAppointment = await Appointment.findOne({
      animal,
      date: { $gte: appointmentDate, $lte: endOfDay },
      time,
      status: { $nin: ['cancelled', 'no-show'] },
    });

    if (existingAppointment) {
      errorResponse(
        res,
        'Conflicting appointment exists for this animal at the same date and time',
        'CONFLICT_ERROR',
        409
      );
      return;
    }

    // Get the authenticated user's ID from request (set by auth middleware)
    const createdBy = (req as Request & { user?: { id?: string } }).user?.id || '';

    const appointment = new Appointment({
      ...result.data,
      createdBy: new mongoose.Types.ObjectId(createdBy),
    });
    await appointment.save();

    const appointmentResponse = appointment.toAppointmentResponse();

    successResponse(res, appointmentResponse, 201);
  } catch (error) {
    console.error('CreateAppointment error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Update appointment
export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = AppointmentUpdateSchema.safeParse(req.body);

    if (!result.success) {
      errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, result.error.issues);
      return;
    }

    // If changing date/time, check for conflicts
    if (result.data.date && result.data.time) {
      const { animal, date, time } = result.data;

      // Get existing appointment to find animal ID
      const existingApt = await Appointment.findById(id);
      if (!existingApt) {
        errorResponse(res, 'Appointment not found', 'APPOINTMENT_NOT_FOUND', 404);
        return;
      }

      const appointmentDate = new Date(date);
      appointmentDate.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: id },
        animal: result.data.animal || existingApt.animal,
        date: { $gte: appointmentDate, $lte: endOfDay },
        time,
        status: { $nin: ['cancelled', 'no-show'] },
      });

      if (conflictingAppointment) {
        errorResponse(
          res,
          'Conflicting appointment exists for this animal at the same date and time',
          'CONFLICT_ERROR',
          409
        );
        return;
      }
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: result.data },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      errorResponse(res, 'Appointment not found', 'APPOINTMENT_NOT_FOUND', 404);
      return;
    }

    const appointmentResponse = appointment.toAppointmentResponse();

    successResponse(res, appointmentResponse);
  } catch (error) {
    console.error('UpdateAppointment error:', error);
    if (error instanceof Error && error.message.includes('ObjectId')) {
      errorResponse(res, 'Invalid appointment ID', 'INVALID_ID', 400);
      return;
    }
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Delete appointment (soft cancel)
export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = AppointmentCancelSchema.safeParse(req.body);

    if (!result.success) {
      errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, result.error.issues);
      return;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'cancelled',
          cancellationReason: result.data.cancellationReason,
        },
      },
      { new: true }
    );

    if (!appointment) {
      errorResponse(res, 'Appointment not found', 'APPOINTMENT_NOT_FOUND', 404);
      return;
    }

    successResponse(res, { message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('DeleteAppointment error:', error);
    if (error instanceof Error && error.message.includes('ObjectId')) {
      errorResponse(res, 'Invalid appointment ID', 'INVALID_ID', 400);
      return;
    }
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Complete appointment
export const completeAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = AppointmentStatusUpdateSchema.safeParse(req.body);

    if (!result.success) {
      // Allow empty body, just set status to completed
      const appointment = await Appointment.findByIdAndUpdate(
        id,
        { $set: { status: 'completed' } },
        { new: true }
      );

      if (!appointment) {
        errorResponse(res, 'Appointment not found', 'APPOINTMENT_NOT_FOUND', 404);
        return;
      }

      const appointmentResponse = appointment.toAppointmentResponse();
      successResponse(res, appointmentResponse);
      return;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        $set: {
          status: result.data.status || 'completed',
          notes: result.data.notes,
        },
      },
      { new: true }
    );

    if (!appointment) {
      errorResponse(res, 'Appointment not found', 'APPOINTMENT_NOT_FOUND', 404);
      return;
    }

    const appointmentResponse = appointment.toAppointmentResponse();

    successResponse(res, appointmentResponse);
  } catch (error) {
    console.error('CompleteAppointment error:', error);
    if (error instanceof Error && error.message.includes('ObjectId')) {
      errorResponse(res, 'Invalid appointment ID', 'INVALID_ID', 400);
      return;
    }
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Confirm appointment
export const confirmAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: { status: 'confirmed' } },
      { new: true }
    );

    if (!appointment) {
      errorResponse(res, 'Appointment not found', 'APPOINTMENT_NOT_FOUND', 404);
      return;
    }

    const appointmentResponse = appointment.toAppointmentResponse();

    successResponse(res, appointmentResponse);
  } catch (error) {
    console.error('ConfirmAppointment error:', error);
    if (error instanceof Error && error.message.includes('ObjectId')) {
      errorResponse(res, 'Invalid appointment ID', 'INVALID_ID', 400);
      return;
    }
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

export default {
  getAppointments,
  getTodayAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  completeAppointment,
  confirmAppointment,
};