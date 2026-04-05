import { PrismaClient, RecordType, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;
/** Demo password for seeded users — change in real deployments. */
const DEMO_PASSWORD = 'Password123!';

async function main() {
  await prisma.financialRecord.deleteMany();
  await prisma.user.deleteMany();

  const password_hash = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@zorvyn.local',
      password_hash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@zorvyn.local',
      password_hash,
      role: Role.ANALYST,
      status: UserStatus.ACTIVE,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@zorvyn.local',
      password_hash,
      role: Role.VIEWER,
      status: UserStatus.ACTIVE,
    },
  });

  const owners = [admin, analyst, viewer];
  const pickOwner = (i: number) => owners[i % owners.length]!;

  const seedRows: Array<{
    amount: string;
    type: RecordType;
    category: string;
    date: Date;
    notes?: string;
    ownerIndex: number;
  }> = [
    {
      amount: '85000.00',
      type: RecordType.INCOME,
      category: 'Salary',
      date: new Date('2025-01-01'),
      notes: 'January payroll (₹)',
      ownerIndex: 0,
    },
    {
      amount: '85000.00',
      type: RecordType.INCOME,
      category: 'Salary',
      date: new Date('2025-02-01'),
      ownerIndex: 1,
    },
    {
      amount: '22000.00',
      type: RecordType.EXPENSE,
      category: 'Rent',
      date: new Date('2025-01-05'),
      ownerIndex: 0,
    },
    {
      amount: '22000.00',
      type: RecordType.EXPENSE,
      category: 'Rent',
      date: new Date('2025-02-05'),
      ownerIndex: 1,
    },
    {
      amount: '4850.50',
      type: RecordType.EXPENSE,
      category: 'Food',
      date: new Date('2025-01-12'),
      ownerIndex: 2,
    },
    {
      amount: '3125.25',
      type: RecordType.EXPENSE,
      category: 'Food',
      date: new Date('2025-02-14'),
      ownerIndex: 0,
    },
    {
      amount: '1200.00',
      type: RecordType.EXPENSE,
      category: 'Transport',
      date: new Date('2025-01-18'),
      ownerIndex: 1,
    },
    {
      amount: '1650.00',
      type: RecordType.EXPENSE,
      category: 'Transport',
      date: new Date('2025-02-20'),
      ownerIndex: 2,
    },
    {
      amount: '2899.00',
      type: RecordType.EXPENSE,
      category: 'Utilities',
      date: new Date('2025-01-22'),
      ownerIndex: 0,
    },
    {
      amount: '3150.50',
      type: RecordType.EXPENSE,
      category: 'Utilities',
      date: new Date('2025-02-22'),
      ownerIndex: 1,
    },
    {
      amount: '12500.00',
      type: RecordType.INCOME,
      category: 'Freelance',
      date: new Date('2025-01-28'),
      ownerIndex: 2,
    },
    {
      amount: '3500.00',
      type: RecordType.EXPENSE,
      category: 'Healthcare',
      date: new Date('2025-02-02'),
      ownerIndex: 0,
    },
    {
      amount: '1899.00',
      type: RecordType.EXPENSE,
      category: 'Food',
      date: new Date('2025-02-25'),
      notes: 'Groceries',
      ownerIndex: 1,
    },
    {
      amount: '1299.00',
      type: RecordType.EXPENSE,
      category: 'Entertainment',
      date: new Date('2025-01-30'),
      ownerIndex: 2,
    },
    {
      amount: '4599.00',
      type: RecordType.EXPENSE,
      category: 'Shopping',
      date: new Date('2025-02-11'),
      ownerIndex: 0,
    },
  ];

  for (const row of seedRows) {
    const user = pickOwner(row.ownerIndex);
    await prisma.financialRecord.create({
      data: {
        user_id: user.id,
        amount: row.amount,
        type: row.type,
        category: row.category,
        date: row.date,
        notes: row.notes ?? null,
      },
    });
  }

  console.log('Seed complete.');
  console.log(`Users (password for all: ${DEMO_PASSWORD}):`);
  console.log(`  Admin:   ${admin.email}`);
  console.log(`  Analyst: ${analyst.email}`);
  console.log(`  Viewer:  ${viewer.email}`);
  console.log(`Financial records created: ${seedRows.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
