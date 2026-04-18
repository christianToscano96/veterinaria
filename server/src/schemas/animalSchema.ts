import { z } from 'zod';

// Species enum using const pattern
const speciesSchema = z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']);

// Gender enum using const pattern
const genderSchema = z.enum(['male', 'female', 'unknown']);

// Animal create schema
const animalCreateSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  species: speciesSchema,
  breed: z.string().optional(),
  color: z.string().optional(),
  gender: genderSchema.optional(),
  birthDate: z.date().optional(),
  weight: z.number().min(0, { message: 'Weight must be a positive number' }).optional(),
  ownerName: z.string().min(1, { message: 'Owner name is required' }),
  ownerPhone: z.string().min(1, { message: 'Owner phone is required' }),
  ownerEmail: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  ownerAddress: z.string().optional(),
  notes: z.string().optional(),
});

// Animal update schema (partial)
const animalUpdateSchema = animalCreateSchema.partial();

// Animal response schema
const animalResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  species: speciesSchema,
  breed: z.string().nullable(),
  color: z.string().nullable(),
  gender: genderSchema.nullable(),
  birthDate: z.date().nullable(),
  weight: z.number().nullable(),
  ownerName: z.string(),
  ownerPhone: z.string(),
  ownerEmail: z.string().nullable(),
  ownerAddress: z.string().nullable(),
  notes: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Pagination query schema
const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  species: speciesSchema.optional(),
  isActive: z.coerce.boolean().optional(),
});

// Export schemas
export const AnimalCreateSchema = animalCreateSchema;
export const AnimalUpdateSchema = animalUpdateSchema;
export const AnimalResponseSchema = animalResponseSchema;
export const PaginationQuerySchema = paginationQuerySchema;

// Export types
export type AnimalCreate = z.infer<typeof animalCreateSchema>;
export type AnimalUpdate = z.infer<typeof animalUpdateSchema>;
export type AnimalResponse = z.infer<typeof animalResponseSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type AnimalSpecies = z.infer<typeof speciesSchema>;
export type AnimalGender = z.infer<typeof genderSchema>;