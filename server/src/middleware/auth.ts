import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { ROLE } from '../models/User';

// User role type
type UserRole = typeof ROLE.ADMIN | typeof ROLE.SECRETARY;

// JWT payload interface with strict typing
export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Standard error response helper
const errorResponse = (
  res: Response,
  message: string,
  code: string = 'INTERNAL_ERROR',
  status = 500
) => {
  res.status(status).json({
    success: false,
    error: { code, message },
  });
};

// Authenticate middleware - verifies JWT, checks isActive, and attaches user to req.user
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      errorResponse(res, 'No token provided', 'NO_TOKEN', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      errorResponse(res, 'JWT secret not configured', 'CONFIG_ERROR', 500);
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Verify user exists and is active in DB
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      errorResponse(res, 'User not found or inactive', 'USER_INACTIVE', 401);
      return;
    }

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    errorResponse(res, 'Invalid token', 'INVALID_TOKEN', 401);
  }
};

// Role-based access middleware factory
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Not authenticated', 'NOT_AUTHENTICATED', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      errorResponse(res, 'Insufficient permissions', 'FORBIDDEN', 403);
      return;
    }

    next();
  };
};

// Shorthand for admin-only access
export const adminOnly = requireRole(['admin']);

// Generate JWT token
export const generateToken = (user: {
  id: string;
  email: string;
  role: string;
}): string => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export default { authenticate, requireRole, adminOnly, generateToken };