# Zorvyn backend

Express + Prisma (SQLite) API with layered `src/` layout (config, controllers, services, repositories, middlewares, routes, schemas, utils).

## Setup

1. Copy environment: `cp .env.example .env`
2. Install dependencies: `npm install`
3. Apply migrations: `npx prisma migrate dev`

## Seed data

Evaluators can populate the database with demo users and financial records (dashboard summary will show non-empty aggregates):

```bash
npx prisma db seed
```

This clears existing `FinancialRecord` and `User` rows, then creates one Admin, one Analyst, one Viewer, and 15 sample records. The script prints demo login emails and the shared demo password.

## Run

```bash
npm run dev
```

Server listens on `PORT` from `.env` (default `3000`). Health check: `GET /health`.

## Notes for the React client

- Dashboard summary (`GET /api/dashboard/summary`) includes `expenseCategoryTotals` for expense-only charts, alongside `categoryTotals` (all types).
- Admins can list users for assignment dropdowns via `GET /api/users` (JWT + `ADMIN` role).
