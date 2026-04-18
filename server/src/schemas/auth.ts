import { z } from 'zod';

// Role enum using const pattern
const roleSchema = z.enum(['admin', 'secretary']);

// Login schema
const userLoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Registration schema
const userRegisterSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .refine(val => /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine(val => /[0-9]/.test(val), {
      message: 'Password must contain at least one number',
    }),
  name: z.string().min(1, { message: 'Name is required' }),
  role: roleSchema,
});

// Update schema (partial)
const userUpdateSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).optional(),
});

// User response schema (without password)
const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: roleSchema,
  isActive: z.boolean(),
  lastLogin: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Auth response schema (token + user)
const authResponseSchema = z.object({
  token: z.string(),
  user: userResponseSchema,
});

export const UserLoginSchema = userLoginSchema;
export const UserRegisterSchema = userRegisterSchema;
export const UserUpdateSchema = userUpdateSchema;
export const UserResponseSchema = userResponseSchema;
export const AuthResponseSchema = authResponseSchema;

export type UserLogin = z.infer<typeof userLoginSchema>;
export type UserRegister = z.infer<typeof userRegisterSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type UserRole = z.infer<typeof roleSchema>;