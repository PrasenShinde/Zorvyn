# Zorvyn backend

REST API for a role-based financial dashboard: **Express 5**, **Prisma ORM**, **SQLite**, **JWT** auth, **Zod** validation, layered architecture under `src/`.

---

## How this backend was built (step-by-step)

These are the steps that were followed to create the project structure and behavior.

### 1. Project layout

We organized code by responsibility (not by dumping logic in one file):

| Folder | Responsibility |
|--------|------------------|
| `src/config/` | Load `.env` with Zod (`env.ts`), Prisma singleton (`database.ts`) |
| `src/schemas/` | Zod schemas for bodies and query strings |
| `src/middlewares/` | Auth JWT, RBAC `authorize`, validation, rate limits, global errors |
| `src/repositories/` | Prisma calls only (users, financial records) |
| `src/services/` | Business rules: auth, records, dashboard aggregates, users list |
| `src/controllers/` | HTTP: map `req`/`res`, call services, set status codes |
| `src/routes/` | Wire paths to middleware + controllers |
| `src/utils/` | `AppError`, `asyncHandler`, serializers |
| `prisma/` | `schema.prisma`, migrations, `seed.ts` |

Entrypoint: `src/server.ts` loads config, starts `createApp()` from `src/app.ts`.

### 2. Database (Prisma + SQLite)

- Defined models in `prisma/schema.prisma`: `User` (role, status), `FinancialRecord` (amount as **string** for safe money in SQLite), soft delete via `deleted_at`.
- Enums: `Role`, `UserStatus`, `RecordType`.
- Ran `npx prisma migrate dev` to create `prisma/migrations/…` and the SQLite file.
- **Note:** SQLite has no native Prisma `Decimal`; amounts are stored as strings (e.g. `"85000.00"`).

### 3. Authentication

- **Register / login** in `auth.service.ts`: bcrypt hash, JWT signed with `JWT_SECRET`, payload `{ id, role }`.
- **Middleware** `authenticate` verifies Bearer token; `authorize([...roles])` checks `req.user.role`.

### 4. Financial records API

- **List** `GET /api/records`: pagination `page`, `limit`; optional filters `type`, `category`; soft-deleted rows excluded. **Admin** sees all rows; **Analyst** only their `user_id`.
- **Create** `POST /api/records` (Admin): Zod validates body including positive amount regex.
- **Update** `PUT /api/records/:id` (Admin): partial `amount`, `category`, `notes`.
- **Delete** `DELETE /api/records/:id` (Admin): soft delete (`deleted_at`).
- Responses use `financialRecordToJson()` so dates are ISO strings in JSON.

### 5. Dashboard summary

- `GET /api/dashboard/summary`: loads active records in the **service** layer (avoids weird SQLite `SUM` on string amounts), computes totals, `expenseCategoryTotals` for charts, `recentActivity` (last 5 by date).

### 6. Users list (for admin UI)

- `GET /api/users` (Admin): returns `id`, `email`, `role`, `status` for assignee dropdowns on create record.

### 7. Query validation bug fix (Express 5)

**Problem:** `validateQuery` used to assign Zod’s output directly to `req.query`. Parsed values are **numbers** (`page`, `limit`) and plain objects. Express 5 expects `req.query` to behave like a query dictionary; replacing it caused **500 Internal Server Error** on `GET /api/records` — so the frontend saw no rows and seed data never appeared.

**Fix:** Parsed query is stored on **`req.validatedQuery`** only. `getRecords` reads `req.validatedQuery` as `ListRecordsQuery`. **Do not assign Zod output to `req.query`.**

### 8. SQLite concurrency

- `DATABASE_URL` includes `?busy_timeout=5000` (see `.env.example`) to reduce `SQLITE_BUSY` when read/write overlap.

### 9. Seeding

- `prisma/seed.ts` clears users and records, creates Admin / Analyst / Viewer (shared demo password), and ~15 INR-style transactions.
- `package.json` → `"prisma": { "seed": "tsx prisma/seed.ts" }`.

---

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm**

---

## Setup (quick start)

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Server: `http://localhost:3000` (or `PORT` in `.env`). Health: `GET /health`.

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | SQLite file, e.g. `file:./dev.db?busy_timeout=5000` |
| `JWT_SECRET` | Secret for signing JWTs (required, min length enforced in `env.ts`) |
| `PORT` | HTTP port (default `3000`) |
| `NODE_ENV` | `development` \| `production` \| `test` |

---

## NPM scripts

| Script | Command |
|--------|---------|
| `npm run dev` | `tsx watch src/server.ts` |
| `npm run build` | `tsc` → `dist/` |
| `npm start` | `node dist/server.js` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:push` | `prisma db push` |
| `npm run db:seed` | `prisma db seed` |

---

## API reference (all under `/api`)

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | `/auth/register` | No | — | Create user (default role VIEWER) |
| POST | `/auth/login` | No | — | Returns `{ token, role }` |
| GET | `/dashboard/summary` | JWT | ADMIN, ANALYST, VIEWER | Aggregates + recent activity |
| GET | `/records` | JWT | ADMIN, ANALYST | Paginated list + filters |
| POST | `/records` | JWT | ADMIN | Create record |
| PUT | `/records/:id` | JWT | ADMIN | Update record |
| DELETE | `/records/:id` | JWT | ADMIN | Soft delete |
| GET | `/users` | JWT | ADMIN | List users for assignment |

---

## RBAC summary

| Capability | VIEWER | ANALYST | ADMIN |
|------------|--------|---------|-------|
| Dashboard summary | Yes | Yes | Yes |
| List records | No | Yes (own rows) | Yes (all) |
| Create / edit / delete records | No | No | Yes |
| List users | No | No | Yes |

---

## Troubleshooting

| Symptom | Likely cause | What to do |
|---------|----------------|------------|
| `500` on `GET /api/records` | Old code mutating `req.query` | Use latest `validate.middleware.ts` + restart server |
| Empty records table in UI | Same 500, or wrong role | Fix backend; log in as **Admin**; check Network tab |
| `SQLITE_BUSY` | Concurrent access | Ensure `busy_timeout` in `DATABASE_URL`; restart API |
| Validation errors on create | Amount format | Use string matching `^\d+(\.\d{1,2})?$` and &gt; 0 |
| No seed data | Seed not run | `npx prisma db seed` |

---

## Production notes

- Switch `DATABASE_URL` to PostgreSQL (or another server DB) if you need real `Decimal` types and heavier concurrency.
- Set a strong `JWT_SECRET`, HTTPS, and tighten CORS in `src/app.ts`.
