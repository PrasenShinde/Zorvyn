import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';
import { userRepository } from '../repositories/user.repository.js';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = '1h';

export type AuthTokenPayload = { id: string; role: Role };

export const authService = {
  async register(email: string, password: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError(409, 'Email already registered');
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({
      email,
      password_hash,
      role: Role.VIEWER,
    });

    const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    return { token, role: user.role };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || user.status === 'INACTIVE') {
      throw new AppError(401, 'Invalid credentials or inactive account');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });

    return { token, role: user.role };
  },
};
