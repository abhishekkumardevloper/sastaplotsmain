import { Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { AuthenticatedRequest, Profile } from '../types';

/**
 * Middleware that requires a valid Supabase JWT token.
 * Verifies the token with Supabase Auth and loads the user profile from the database.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. No Bearer token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Invalid authorization token.',
      });
      return;
    }

    // Verify token with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authData.user) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired session token.',
      });
      return;
    }

    const authUser = authData.user;

    // Load user profile from the database (server-side role check)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      // If profile hasn't been created yet, attempt to self-heal or reject
      res.status(404).json({
        success: false,
        error: 'User profile not found. Please contact support.',
      });
      return;
    }

    // Check if user is active
    if (!profile.is_active) {
      res.status(403).json({
        success: false,
        error: 'Your account has been deactivated or suspended.',
      });
      return;
    }

    // Attach profile to request object
    req.user = profile as Profile;
    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal authentication error.',
    });
  }
}

/**
 * Optional authentication middleware.
 * If a valid token is provided, attaches `req.user`.
 * If no token is provided or invalid, continues without error.
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next();
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authData.user) {
      return next();
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profile && profile.is_active) {
      req.user = profile as Profile;
    }

    next();
  } catch (error) {
    // Non-blocking in optional auth
    next();
  }
}

export const authMiddleware = requireAuth;
