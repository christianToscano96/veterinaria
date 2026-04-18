import { z } from 'zod';

// Vaccination create schema
const vaccinationCreateSchema = z.object({
  animal: z.string().min(1, { message: 'Animal ID is required' }),
  name: z.string().min(1, { message: 'Vaccination name is required' }),
  dateAdministered: z.coerce.date({ message: 'Date administered is required' }),
  nextDueDate: z.coerce.date().optional(),
  batchNumber: z.string().optional(),
  laboratory: z.string().optional(),
  notes: z.string().optional(),
  veterinarian: z.string().optional(),
});

// Vaccination update schema (partial)
const vaccinationUpdateSchema = z.object({
  name: z.string().min(1, { message: 'Vaccination name is required' }).optional(),
  dateAdministered: z.coerce.date({ message: 'Invalid date' }).optional(),
  nextDueDate: z.coerce.date().optional(),
  batchNumber: z.string().optional(),
  laboratory: z.string().optional(),
  notes: z.string().optional(),
  veterinarian: z.string().optional(),
  reminderSent: z.boolean().optional(),
  reminderDate: z.coerce.date().optional(),
});

// Vaccination response schema
const vaccinationResponseSchema = z.object({
  id: z.string(),
  animal: z.string(),
  name: z.string(),
  dateAdministered: z.date(),
  nextDueDate: z.date().nullable(),
  batchNumber: z.string().nullable(),
  laboratory: z.string().nullable(),
  notes: z.string().nullable(),
  veterinarian: z.string().nullable(),
  reminderSent: z.boolean(),
  reminderDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Query schema for upcoming vaccinations
const upcomingQuerySchema = z.object({
  days: z.coerce.number().int().positive().default(30),
});

// Export schemas
export const VaccinationCreateSchema = vaccinationCreateSchema;
export const VaccinationUpdateSchema = vaccinationUpdateSchema;
export const VaccinationResponseSchema = vaccinationResponseSchema;
export const UpcomingQuerySchema = upcomingQuerySchema;

// Export types
export type VaccinationCreate = z.infer<typeof vaccinationCreateSchema>;
export type VaccinationUpdate = z.infer<typeof vaccinationUpdateSchema>;
export type VaccinationResponse = z.infer<typeof vaccinationResponseSchema>;
export type UpcomingQuery = z.infer<typeof upcomingQuerySchema>;