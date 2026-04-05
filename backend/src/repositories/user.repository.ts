import type { Prisma, Role, User, UserStatus } from '@prisma/client';
import { prisma } from '../config/database.js';

export const userRepository = {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  create(data: {
    email: string;
    password_hash: string;
    role?: Role;
    status?: UserStatus;
  }): Promise<User> {
    return prisma.user.create({ data });
  },

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },

  findManySummary(): Promise<Array<{ id: string; email: string; role: Role; status: UserStatus }>> {
    return prisma.user.findMany({
      select: { id: true, email: true, role: true, status: true },
      orderBy: { email: 'asc' },
    });
  },
};
