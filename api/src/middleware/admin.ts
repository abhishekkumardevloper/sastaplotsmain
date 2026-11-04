import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware that verifies the authenticated user has an 'admin' or 'super_admin' role.
 * Must be preceded by `requireAuth` middleware.
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required before checking administrator privileges.',
    });
    return;
  }

  const role = req.user.role;
  if (role !== 'admin' && role !== 'super_admin') {
    res.status(403).json({
      success: false,
      error: 'Access denied: Administrator privileges required.',
    });
    return;
  }

  next();
}

/**
 * Middleware that strictly verifies the authenticated user has a 'super_admin' role.
 */
export function requireSuperAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required before checking super administrator privileges.',
    });
    return;
  }

  if (req.user.role !== 'super_admin') {
    res.status(403).json({
      success: false,
      error: 'Access denied: Super Administrator privileges required.',
    });
    return;
  }

  next();
}

export const adminMiddleware = requireAdmin;
