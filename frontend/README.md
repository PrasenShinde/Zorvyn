# Zorvyn frontend

React **SPA** for the Zorvyn financial dashboard: **Vite**, **TypeScript**, **Tailwind CSS v4**, **React Router**, **axios**, **lucide-react**, **recharts**, **sonner** toasts.

It talks to the **Express API** in `../backend` (JWT + RBAC).

---

## How this frontend was built (step-by-step)

### 1. Tooling

- **Vite** (`@vitejs/plugin-react`) for dev server and production build.
- **Tailwind v4** via `@tailwindcss/vite` plugin in `vite.config.js`.
- **TypeScript** (`tsconfig.json`) with `src/**/*.tsx` entry at `main.tsx`.

### 2. Styling and theme

- Global styles in `src/index.css`: `@import 'tailwindcss'` and `@theme { }` with the executive palette:
  - **primary** `#191E29`, **secondary** `#132D46`, **accent** `#01C38D`, **muted** `#696E79`, **surface** `#FFFFFF`
- **DM Sans** loaded from Google Fonts in `index.html`.
- Layout uses the **60-30-10** rule: large areas primary/secondary, accent for CTAs and highlights.

### 3. API client

- **`src/lib/api.ts`**: axios instance with:
  - **Request** interceptor: reads JWT from `localStorage` and sets `Authorization: Bearer …`
  - **Response** interceptor: on **401**, clears auth and redirects to `/login` (except while on login page)
- **Base URL**: empty in development so requests go to the same origin; **Vite proxy** forwards `/api` → `http://localhost:3000` (see `vite.config.js`).
- Production: set **`VITE_API_URL`** to your API origin (see `.env.example`).

### 4. Auth state

- **`src/lib/auth-storage.ts`**: `token` + `role` in `localStorage`.
- **`src/context/AuthContext.tsx`**: `login`, `logout`, `useAuth()`; login calls `POST /api/auth/login` then stores token/role and navigates to `/dashboard`.

### 5. Routing and guards

- **`src/App.tsx`**: `BrowserRouter`, routes:
  - `/login` — public
  - Protected shell: **`ProtectedRoute`** (no token → redirect login)
  - **`AppLayout`**: collapsible sidebar + header (role badge, logout)
  - `/dashboard` — summary for all roles
  - `/records` — wrapped in **`RecordsRoute`**: **VIEWER** redirected to `/dashboard` (sidebar link hidden for viewers)
- **`src/routes/ProtectedRoute.tsx`**, **`RecordsRoute.tsx`**

### 6. Pages

- **`LoginPage`**: centered card, `POST /api/auth/login`, toasts on error.
- **`DashboardPage`**: `GET /api/dashboard/summary` — KPI cards (INR via `formatCurrency`), doughnut chart from `expenseCategoryTotals`, recent activity table; skeletons while loading.
- **`RecordsPage`**: `GET /api/records` with pagination and filters; **Admin** gets create/edit modals and delete; **Analyst** read-only table.
  - After **create**, state resets to **page 1** and **clears filters**, and a **`refetchTick`** forces a new fetch (fixes “record created but not visible” when list didn’t refetch).
  - In-flight list requests use a **generation counter** so an older response cannot overwrite a newer one.

### 7. Money display

- **`src/lib/money.ts`**: `Intl.NumberFormat('en-IN', { currency: 'INR' })` so amounts show as **₹** (backend still stores amount strings).

### 8. Modals and UX

- **`RecordFormModal`**: create (all fields + user picker from `GET /api/users`) and edit (amount, category, notes). Submit lock prevents double POST.
- **`sonner`**: success/error toasts; delete row uses a short opacity transition then refetch.

### 9. ESLint

- **`typescript-eslint`** + React Hooks + React Refresh; `npm run lint`.

---

## Prerequisites

- **Node.js** 18+
- **Backend** running (see `../backend/README.md`) on port **3000** for local dev (or match your proxy target).

---

## Setup

```bash
cd frontend
cp .env.example .env   # optional; leave empty to use Vite proxy
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

**Important:** Start the **backend** first (`cd ../backend && npm run dev`). If `GET /api/records` fails with 500, update backend to the latest version (especially query validation fix) and **restart** the API server.

---

## NPM scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server + HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

---

## Seeded demo logins

After `npx prisma db seed` in **backend**:

| Email | Password | Role |
|-------|----------|------|
| `admin@zorvyn.local` | `Password123!` | ADMIN |
| `analyst@zorvyn.local` | `Password123!` | ANALYST |
| `viewer@zorvyn.local` | `Password123!` | VIEWER |

Use **Admin** to see **all** records and CRUD; **Analyst** sees only assigned rows; **Viewer** sees dashboard only.

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Records page: “Internal server error” | Backend **must** use `req.validatedQuery` for list (not assigning Zod output to `req.query`). Restart backend after `git pull`. |
| No rows after seed | Log in as **Admin**; confirm `GET /api/records` returns **200** in browser Network tab. |
| CORS in production | Set `VITE_API_URL` to API URL; configure backend `cors()` for that origin. |
| 401 loop | Clear site data / localStorage; log in again. |
| Create succeeds but row missing | Fixed by refetch + reset page/filters; ensure backend list endpoint returns 200. |

---

## Repository layout (frontend)

```
frontend/
├── index.html
├── vite.config.js          # React + Tailwind + /api proxy
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css           # Tailwind @theme
│   ├── lib/                # api, auth-storage, money
│   ├── types/              # API DTOs
│   ├── context/            # AuthProvider
│   ├── routes/             # route guards
│   ├── components/
│   │   ├── layout/         # Sidebar, header, shell
│   │   ├── records/        # Record form modal
│   │   └── ui/             # Modal, skeleton
│   └── pages/              # Login, Dashboard, Records
└── .env.example
```
