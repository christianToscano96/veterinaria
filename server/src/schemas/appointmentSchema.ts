import { z } from 'zod';

// Appointment type enum using const pattern
const appointmentTypeSchema = z.enum([
  'consultation',
  'vaccination',
  'surgery',
  'checkup',
  'emergency',
  'other',
]);

// Appointment status enum using const pattern
const appointmentStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'in-progress',
  'completed',
  'cancelled',
  'no-show',
]);

// Appointment create schema
const appointmentCreateSchema = z.object({
  animal: z.string().min(1, { message: 'Animal ID is required' }),
  veterinarian: z.string().min(1, { message: 'Veterinarian ID is required' }),
  date: z.date({ message: 'Date is required' }),
  time: z.string().min(1, { message: 'Time is required' }),
  duration: z.number().min(15).max(480).default(30),
  type: appointmentTypeSchema,
  reason: z.string().optional(),
  notes: z.string().optional(),
});

// Appointment update schema (partial)
const appointmentUpdateSchema = appointmentCreateSchema.partial().extend({
  status: appointmentStatusSchema.optional(),
  cancellationReason: z.string().optional(),
});

// Appointment response schema
const appointmentResponseSchema = z.object({
  id: z.string(),
  animal: z.string(),
  veterinarian: z.string(),
  date: z.date(),
  time: z.string(),
  duration: z.number(),
  type: appointmentTypeSchema,
  reason: z.string().nullable(),
  status: appointmentStatusSchema,
  notes: z.string().nullable(),
  cancellationReason: z.string().nullable(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Appointment query schema
const appointmentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  date: z.coerce.date().optional(),
  veterinarian: z.string().optional(),
  status: appointmentStatusSchema.optional(),
  animal: z.string().optional(),
});

// Appointment status update schema (for confirm/complete)
const appointmentStatusUpdateSchema = z.object({
  status: appointmentStatusSchema,
  notes: z.string().optional(),
});

// Cancellation schema
const appointmentCancelSchema = z.object({
  cancellationReason: z.string().min(1, { message: 'Cancellation reason is required' }),
});

// Export schemas
export const AppointmentCreateSchema = appointmentCreateSchema;
export const AppointmentUpdateSchema = appointmentUpdateSchema;
export const AppointmentResponseSchema = appointmentResponseSchema;
export const AppointmentQuerySchema = appointmentQuerySchema;
export const AppointmentStatusUpdateSchema = appointmentStatusUpdateSchema;
export const AppointmentCancelSchema = appointmentCancelSchema;

// Export types
export type AppointmentCreate = z.infer<typeof appointmentCreateSchema>;
export type AppointmentUpdate = z.infer<typeof appointmentUpdateSchema>;
export type AppointmentResponse = z.infer<typeof appointmentResponseSchema>;
export type AppointmentQuery = z.infer<typeof appointmentQuerySchema>;
export type AppointmentStatusUpdate = z.infer<typeof appointmentStatusUpdateSchema>;
export type AppointmentCancel = z.infer<typeof appointmentCancelSchema>;
export type AppointmentType = z.infer<typeof appointmentTypeSchema>;
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;