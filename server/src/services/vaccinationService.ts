import { addDays, isBefore, isWithinInterval, startOfDay } from 'date-fns';
import Vaccination from '../models/Vaccination';
import type { IVaccination } from '../models/Vaccination';
import type { VaccinationCreate, VaccinationUpdate } from '../schemas/vaccinationSchema';
import mongoose from 'mongoose';

// Status constants
const VACCINATION_STATUS = {
  OK: 'ok',
  DUE_SOON: 'due-soon',
  OVERDUE: 'overdue',
} as const;

type VaccinationStatus = (typeof VACCINATION_STATUS)[keyof typeof VACCINATION_STATUS];

// Threshold in days for "due soon" status
const DUE_SOON_THRESHOLD_DAYS = 30;

/**
 * Calculate vaccination status based on next due date
 */
export function calculateVaccinationStatus(nextDueDate: Date | null | undefined): VaccinationStatus {
  if (!nextDueDate) {
    return VACCINATION_STATUS.OK;
  }

  const today = startOfDay(new Date());
  const dueDate = startOfDay(nextDueDate);
  const thresholdDate = addDays(today, DUE_SOON_THRESHOLD_DAYS);

  // Check if overdue (past due date)
  if (isBefore(dueDate, today)) {
    return VACCINATION_STATUS.OVERDUE;
  }

  // Check if due soon (within 30 days)
  if (isWithinInterval(dueDate, { start: today, end: thresholdDate })) {
    return VACCINATION_STATUS.DUE_SOON;
  }

  // OK - more than 30 days until due
  return VACCINATION_STATUS.OK;
}

/**
 * Get all vaccinations for a specific animal
 */
export async function getAllForAnimal(animalId: string): Promise<unknown[]> {
  // Validate ObjectId format - return empty array for invalid IDs
  if (!animalId || typeof animalId !== 'string' || !mongoose.Types.ObjectId.isValid(animalId)) {
    console.warn('Invalid animal ID received:', animalId);
    return [];
  }

  const vaccinations = await Vaccination.find({ animal: animalId })
    .sort({ dateAdministered: -1 })
    .populate('veterinarian', 'name email')
    .lean();

  return vaccinations;
}

/**
 * Get upcoming vaccinations within specified days
 */
export async function getUpcoming(days: number = 30): Promise<unknown[]> {
  const today = startOfDay(new Date());
  const futureDate = addDays(today, days);

  const vaccinations = await Vaccination.find({
    nextDueDate: {
      $gte: today,
      $lte: futureDate,
    },
    reminderSent: false,
  })
    .sort({ nextDueDate: 1 })
    .populate('animal', 'name species ownerName ownerPhone')
    .populate('veterinarian', 'name email')
    .lean();

  return vaccinations;
}

/**
 * Get overdue vaccinations (past due date)
 */
export async function getOverdue(): Promise<unknown[]> {
  const today = startOfDay(new Date());

  const vaccinations = await Vaccination.find({
    nextDueDate: {
      $lt: today,
    },
    reminderSent: false,
  })
    .sort({ nextDueDate: 1 })
    .populate('animal', 'name species ownerName ownerPhone')
    .populate('veterinarian', 'name email')
    .lean();

  return vaccinations;
}

/**
 * Get vaccination by ID
 */
export async function getById(id: string): Promise<unknown | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const vaccination = await Vaccination.findById(id)
    .populate('animal', 'name species ownerName ownerPhone ownerEmail')
    .populate('veterinarian', 'name email')
    .lean();

  return vaccination;
}

/**
 * Create a new vaccination record
 */
export async function create(data: VaccinationCreate): Promise<IVaccination> {
  const vaccinationData = {
    ...data,
    animal: new mongoose.Types.ObjectId(data.animal),
    ...(data.veterinarian && { veterinarian: new mongoose.Types.ObjectId(data.veterinarian) }),
  };

  const vaccination = new Vaccination(vaccinationData);
  await vaccination.save();
  return vaccination;
}

/**
 * Update an existing vaccination record
 */
export async function update(id: string, data: VaccinationUpdate): Promise<unknown | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const updateData: Record<string, unknown> = { ...data };

  // Convert string IDs to ObjectId
  if (data.veterinarian) {
    updateData.veterinarian = new mongoose.Types.ObjectId(data.veterinarian);
  }

  const vaccination = await Vaccination.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  )
    .populate('animal', 'name species ownerName ownerPhone')
    .populate('veterinarian', 'name email')
    .lean();

  return vaccination;
}

/**
 * Delete a vaccination record
 */
export async function remove(id: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }

  const result = await Vaccination.findByIdAndDelete(id);
  return result !== null;
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(id: string): Promise<unknown | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const vaccination = await Vaccination.findByIdAndUpdate(
    id,
    {
      $set: {
        reminderSent: true,
        reminderDate: new Date(),
      },
    },
    { new: true }
  ).lean();

  return vaccination;
}

export { VACCINATION_STATUS, VaccinationStatus, DUE_SOON_THRESHOLD_DAYS };