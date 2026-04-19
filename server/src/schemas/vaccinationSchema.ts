import { z } from 'zod';

// Helper to validate MongoDB ObjectId - more permissive for better UX
// The service will validate the actual ObjectId format
const objectIdSchema = z.string().min(1, { message: 'ID is required' });

// Helper to coerce string/date to Date object
const coerceToDate = (val: unknown): Date | undefined => {
  if (!val) return undefined;
  if (val instanceof Date) return val;
  if (typeof val === 'string' || typeof val === 'number') {
    const date = new Date(val);
    if (!isNaN(date.getTime())) return date;
  }
  return undefined;
};

// Vaccination create schema - accepts either string or Date
const vaccinationCreateSchema = z.object({
  animal: objectIdSchema,
  name: z.string().min(1, { message: 'Vaccination name is required' }),
  dateAdministered: z.union([z.string(), z.date()]).transform(val => {
    const date = coerceToDate(val);
    if (!date) throw new Error('Invalid date');
    return date;
  }),
  nextDueDate: z.union([z.string(), z.date(), z.undefined()]).optional().transform(val => {
    if (val === undefined || val === '') return undefined;
    return coerceToDate(val);
  }),
  batchNumber: z.string().optional(),
  laboratory: z.string().optional(),
  notes: z.string().optional(),
  veterinarian: objectIdSchema.optional(),
});

// Vaccination update schema (partial)
const vaccinationUpdateSchema = z.object({
  name: z.string().min(1, { message: 'Vaccination name is required' }).optional(),
  dateAdministered: z.string().optional().transform(val => {
    if (!val || val === '') return undefined;
    const date = new Date(val);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    return date;
  }),
  nextDueDate: z.string().optional().transform(val => {
    if (!val || val === '') return undefined;
    const date = new Date(val);
    if (isNaN(date.getTime())) return undefined;
    return date;
  }),
  batchNumber: z.string().optional(),
  laboratory: z.string().optional(),
  notes: z.string().optional(),
  veterinarian: objectIdSchema.optional(),
  reminderSent: z.boolean().optional(),
  reminderDate: z.string().optional().transform(val => {
    if (!val || val === '') return undefined;
    const date = new Date(val);
    if (isNaN(date.getTime())) return undefined;
    return date;
  }),
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