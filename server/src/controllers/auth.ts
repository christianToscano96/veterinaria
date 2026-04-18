import { Request, Response } from 'express';
import User from '../models/User';
import {
  UserLoginSchema,
  UserRegisterSchema,
  UserUpdateSchema,
  AuthResponseSchema,
} from '../schemas/auth';
import { generateToken } from '../middleware/auth';

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

// Login handler
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = UserLoginSchema.safeParse(req.body);

    if (!result.success) {
      errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, result.error.issues);
      return;
    }

    const { email, password } = result.data;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      errorResponse(res, 'Invalid credentials', 'INVALID_CREDENTIALS', 401);
      return;
    }

    if (!user.isActive) {
      errorResponse(res, 'Account is deactivated', 'ACCOUNT_INACTIVE', 401);
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      errorResponse(res, 'Invalid credentials', 'INVALID_CREDENTIALS', 401);
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userResponse = user.toUserResponse();

    successResponse(res, {
      token,
      user: {
        id: userResponse.id,
        email: userResponse.email,
        name: userResponse.name,
        role: userResponse.role,
        isActive: userResponse.isActive,
        lastLogin: userResponse.lastLogin,
        createdAt: userResponse.createdAt,
        updatedAt: userResponse.updatedAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Register handler (TEMPORAL: público para testing - luego agregar admin key)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Add admin key validation once testing is done
    // const adminKey = req.headers['x-admin-key'] as string;
    // if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    //   errorResponse(res, 'Invalid admin key', 'INVALID_ADMIN_KEY', 401);
    //   return;
    // }

    const result = UserRegisterSchema.safeParse(req.body);

    if (!result.success) {
      errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, result.error.issues);
      return;
    }

    const { email, password, name, role } = result.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      errorResponse(res, 'Email already registered', 'EMAIL_EXISTS', 400);
      return;
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role,
    });

    await user.save();

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userResponse = user.toUserResponse();

    successResponse(res, {
      token,
      user: {
        id: userResponse.id,
        email: userResponse.email,
        name: userResponse.name,
        role: userResponse.role,
        isActive: userResponse.isActive,
        lastLogin: userResponse.lastLogin,
        createdAt: userResponse.createdAt,
        updatedAt: userResponse.updatedAt,
      },
    }, 201);
  } catch (error) {
    console.error('Register error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Get current user
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Not authenticated', 'NOT_AUTHENTICATED', 401);
      return;
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
      return;
    }

    const userResponse = user.toUserResponse();

    successResponse(res, {
      id: userResponse.id,
      email: userResponse.email,
      name: userResponse.name,
      role: userResponse.role,
      isActive: userResponse.isActive,
      lastLogin: userResponse.lastLogin,
      createdAt: userResponse.createdAt,
      updatedAt: userResponse.updatedAt,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Update current user
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Not authenticated', 'NOT_AUTHENTICATED', 401);
      return;
    }

    const result = UserUpdateSchema.safeParse(req.body);

    if (!result.success) {
      errorResponse(res, 'Validation failed', 'VALIDATION_ERROR', 400, result.error.issues);
      return;
    }

    const { name } = result.data;

    const user = await User.findById(req.user.id);

    if (!user) {
      errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
      return;
    }

    if (name) {
      user.name = name;
    }

    await user.save();

    const userResponse = user.toUserResponse();

    successResponse(res, {
      id: userResponse.id,
      email: userResponse.email,
      name: userResponse.name,
      role: userResponse.role,
      isActive: userResponse.isActive,
      lastLogin: userResponse.lastLogin,
      createdAt: userResponse.createdAt,
      updatedAt: userResponse.updatedAt,
    });
  } catch (error) {
    console.error('UpdateMe error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Refresh token
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, 'Not authenticated', 'NOT_AUTHENTICATED', 401);
      return;
    }

    const user = await User.findById(req.user.id);

    if (!user || !user.isActive) {
      errorResponse(res, 'User not found or inactive', 'USER_INACTIVE', 401);
      return;
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const userResponse = user.toUserResponse();

    successResponse(res, {
      token,
      user: {
        id: userResponse.id,
        email: userResponse.email,
        name: userResponse.name,
        role: userResponse.role,
        isActive: userResponse.isActive,
        lastLogin: userResponse.lastLogin,
        createdAt: userResponse.createdAt,
        updatedAt: userResponse.updatedAt,
      },
    });
  } catch (error) {
    console.error('Refresh error:', error);
    errorResponse(res, 'Internal server error', 'INTERNAL_ERROR');
  }
};

// Logout (client-side token removal)
export const logout = async (req: Request, res: Response): Promise<void> => {
  // In a stateless JWT setup, logout is handled client-side
  successResponse(res, { message: 'Logged out successfully' });
};

export default {
  login,
  register,
  getMe,
  updateMe,
  refresh,
  logout,
};