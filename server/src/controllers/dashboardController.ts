import { Request, Response } from 'express';
import { startOfDay, endOfDay, addDays, isBefore, startOfToday } from 'date-fns';
import Animal from '../models/Animal';
import Appointment from '../models/Appointment';
import Vaccination from '../models/Vaccination';
import MedicalRecord from '../models/MedicalRecord';

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

// Get dashboard statistics
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = startOfToday();
    const tomorrow = addDays(today, 1);

    // Parallel execution for better performance
    const [
      totalAnimals,
      todayAppointments,
      pendingVaccinations,
      // SocialPost model not yet implemented - count as 0
    ] = await Promise.all([
      // Count active animals
      Animal.countDocuments({ isActive: true }),
      // Count today's appointments
      Appointment.countDocuments({
        date: { $gte: startOfDay(today), $lt: endOfDay(tomorrow) },
        status: { $nin: ['cancelled', 'no-show'] },
      }),
      // Count pending vaccinations (next 30 days)
      Vaccination.countDocuments({
        nextDueDate: {
          $gte: today,
          $lte: addDays(today, 30),
        },
        reminderSent: false,
      }),
    ]);

    // Draft posts count (placeholder - model not implemented yet)
    const draftPosts = 0;

    successResponse(res, {
      totalAnimals,
      appointmentsToday: todayAppointments,
      pendingVaccinations,
      draftPosts,
    });
  } catch (error) {
    console.error('GetStats error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Get today's appointments with animal and veterinarian populated
export const getTodayAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = startOfToday();
    const tomorrow = addDays(today, 1);

    const appointments = await Appointment.find({
      date: { $gte: startOfDay(today), $lt: endOfDay(tomorrow) },
    })
      .sort({ time: 1 })
      .populate('animal', 'name species breed ownerName ownerPhone')
      .populate('veterinarian', 'name email')
      .lean();

    // Transform to response format
    const appointmentsResponse = appointments.map((apt) => {
      const obj = { ...apt } as Record<string, unknown>;
      obj.id = obj._id;
      
      // Handle populated animal
      if (obj.animal && typeof obj.animal === 'object' && '_id' in obj.animal) {
        obj.animal = {
          id: (obj.animal as Record<string, unknown>)._id?.toString(),
          name: (obj.animal as Record<string, unknown>).name,
          species: (obj.animal as Record<string, unknown>).species,
          breed: (obj.animal as Record<string, unknown>).breed,
          ownerName: (obj.animal as Record<string, unknown>).ownerName,
          ownerPhone: (obj.animal as Record<string, unknown>).ownerPhone,
        };
      }
      
      // Handle populated veterinarian
      if (obj.veterinarian && typeof obj.veterinarian === 'object' && '_id' in obj.veterinarian) {
        obj.veterinarian = {
          id: (obj.veterinarian as Record<string, unknown>)._id?.toString(),
          name: (obj.veterinarian as Record<string, unknown>).name,
          email: (obj.veterinarian as Record<string, unknown>).email,
        };
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

// Get upcoming vaccinations (next 7-30 days) with status
export const getUpcomingVaccinations = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = startOfToday();
    const futureDate = addDays(today, 30);

    const vaccinations = await Vaccination.find({
      nextDueDate: {
        $gte: today,
        $lte: futureDate,
      },
    })
      .sort({ nextDueDate: 1 })
      .populate('animal', 'name species breed ownerName ownerPhone')
      .populate('veterinarian', 'name email')
      .lean();

    // Transform with status calculation
    const vaccinationsResponse = vaccinations.map((v) => {
      const obj = { ...v } as Record<string, unknown>;
      obj.id = obj._id;
      
      // Calculate status based on nextDueDate
      const nextDueDate = obj.nextDueDate as Date | null;
      if (nextDueDate) {
        const dueDate = startOfDay(nextDueDate);
        const dueSoonDate = addDays(today, 30);
        
        if (isBefore(dueDate, today)) {
          obj.status = 'overdue';
        } else if (dueDate <= dueSoonDate) {
          obj.status = 'due-soon';
        } else {
          obj.status = 'ok';
        }
      } else {
        obj.status = 'ok';
      }
      
      // Handle populated animal
      if (obj.animal && typeof obj.animal === 'object' && '_id' in obj.animal) {
        obj.animal = {
          id: (obj.animal as Record<string, unknown>)._id?.toString(),
          name: (obj.animal as Record<string, unknown>).name,
          species: (obj.animal as Record<string, unknown>).species,
          breed: (obj.animal as Record<string, unknown>).breed,
          ownerName: (obj.animal as Record<string, unknown>).ownerName,
          ownerPhone: (obj.animal as Record<string, unknown>).ownerPhone,
        };
      }
      
      // Handle populated veterinarian
      if (obj.veterinarian && typeof obj.veterinarian === 'object' && '_id' in obj.veterinarian) {
        obj.veterinarian = {
          id: (obj.veterinarian as Record<string, unknown>)._id?.toString(),
          name: (obj.veterinarian as Record<string, unknown>).name,
          email: (obj.veterinarian as Record<string, unknown>).email,
        };
      }
      
      delete obj._id;
      return obj;
    });

    successResponse(res, vaccinationsResponse);
  } catch (error) {
    console.error('GetUpcomingVaccinations error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Get overdue vaccinations (past due date)
export const getOverdueVaccinations = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = startOfToday();

    const vaccinations = await Vaccination.find({
      nextDueDate: {
        $lt: today,
      },
    })
      .sort({ nextDueDate: 1 })
      .populate('animal', 'name species breed ownerName ownerPhone')
      .populate('veterinarian', 'name email')
      .lean();

    // Transform with status
    const vaccinationsResponse = vaccinations.map((v) => {
      const obj = { ...v } as Record<string, unknown>;
      obj.id = obj._id;
      obj.status = 'overdue';
      
      // Handle populated animal
      if (obj.animal && typeof obj.animal === 'object' && '_id' in obj.animal) {
        obj.animal = {
          id: (obj.animal as Record<string, unknown>)._id?.toString(),
          name: (obj.animal as Record<string, unknown>).name,
          species: (obj.animal as Record<string, unknown>).species,
          breed: (obj.animal as Record<string, unknown>).breed,
          ownerName: (obj.animal as Record<string, unknown>).ownerName,
          ownerPhone: (obj.animal as Record<string, unknown>).ownerPhone,
        };
      }
      
      // Handle populated veterinarian
      if (obj.veterinarian && typeof obj.veterinarian === 'object' && '_id' in obj.veterinarian) {
        obj.veterinarian = {
          id: (obj.veterinarian as Record<string, unknown>)._id?.toString(),
          name: (obj.veterinarian as Record<string, unknown>).name,
          email: (obj.veterinarian as Record<string, unknown>).email,
        };
      }
      
      delete obj._id;
      return obj;
    });

    successResponse(res, vaccinationsResponse);
  } catch (error) {
    console.error('GetOverdueVaccinations error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Get recent activity - last 10 records from appointments + vaccinations + medical records
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get recent appointments
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1, updatedAt: -1 })
      .limit(5)
      .populate('animal', 'name species')
      .populate('veterinarian', 'name')
      .lean();

    // Get recent vaccinations
    const recentVaccinations = await Vaccination.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('animal', 'name species')
      .populate('veterinarian', 'name')
      .lean();

    // Get recent medical records
    const recentMedicalRecords = await MedicalRecord.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('animal', 'name species')
      .populate('veterinarian', 'name')
      .lean();

    // Transform and combine all activities
    const transformAppointment = (apt: Record<string, unknown>) => ({
      id: apt._id?.toString(),
      type: 'appointment',
      action: 'created',
      status: apt.status,
      date: apt.date,
      time: apt.time,
      animal: apt.animal ? {
        id: (apt.animal as Record<string, unknown>)._id?.toString(),
        name: (apt.animal as Record<string, unknown>).name,
        species: (apt.animal as Record<string, unknown>).species,
      } : null,
      veterinarian: apt.veterinarian ? {
        id: (apt.veterinarian as Record<string, unknown>)._id?.toString(),
        name: (apt.veterinarian as Record<string, unknown>).name,
      } : null,
      createdAt: apt.createdAt,
    });

    const transformVaccination = (v: Record<string, unknown>) => ({
      id: v._id?.toString(),
      type: 'vaccination',
      action: 'administered',
      name: v.name,
      nextDueDate: v.nextDueDate,
      animal: v.animal ? {
        id: (v.animal as Record<string, unknown>)._id?.toString(),
        name: (v.animal as Record<string, unknown>).name,
        species: (v.animal as Record<string, unknown>).species,
      } : null,
      veterinarian: v.veterinarian ? {
        id: (v.veterinarian as Record<string, unknown>)._id?.toString(),
        name: (v.veterinarian as Record<string, unknown>).name,
      } : null,
      createdAt: v.createdAt,
    });

    const transformMedicalRecord = (mr: Record<string, unknown>) => ({
      id: mr._id?.toString(),
      type: 'medical-record',
      action: 'created',
      recordType: mr.type,
      diagnosis: mr.diagnosis,
      animal: mr.animal ? {
        id: (mr.animal as Record<string, unknown>)._id?.toString(),
        name: (mr.animal as Record<string, unknown>).name,
        species: (mr.animal as Record<string, unknown>).species,
      } : null,
      veterinarian: mr.veterinarian ? {
        id: (mr.veterinarian as Record<string, unknown>)._id?.toString(),
        name: (mr.veterinarian as Record<string, unknown>).name,
      } : null,
      createdAt: mr.createdAt,
    });

    // Combine all activities
    const allActivity = [
      ...recentAppointments.map(transformAppointment),
      ...recentVaccinations.map(transformVaccination),
      ...recentMedicalRecords.map(transformMedicalRecord),
    ];

    // Sort by createdAt descending and take top 10
    allActivity.sort((a, b) => {
      const dateA = new Date(a.createdAt as Date).getTime();
      const dateB = new Date(b.createdAt as Date).getTime();
      return dateB - dateA;
    });

    const recentActivity = allActivity.slice(0, 10);

    successResponse(res, recentActivity);
  } catch (error) {
    console.error('GetRecentActivity error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

export default {
  getStats,
  getTodayAppointments,
  getUpcomingVaccinations,
  getOverdueVaccinations,
  getRecentActivity,
};