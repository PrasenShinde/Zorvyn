import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  user?: { id: string; role: Role };
}

type JwtPayload = { id: string; role: Role };

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const authorize =
  (allowedRoles: Role[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
