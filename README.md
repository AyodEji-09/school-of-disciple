# RCCG School of Disciples (SOD) — Americas-1 Portal

Official web application for the **Redeemed Christian Church of God (RCCG) School of Disciples — Americas-1**, uniting public discovery, student registration and intake onboarding, Stripe/Zelle payment verification, manual ordering, exam appointment scheduling, and academic result management in a single React + TypeScript SPA.

---

## Features by Role

### Public & Students
- **Public Discovery:** Landing, About, and Leadership Team pages.
- **Auth & Multi-Step Intake Onboarding:** Registration, login, password reset, and required intake onboarding (`/onboarding/*`) gated before full portal access.
- **Student Self-Service:** Student dashboard, profile management, Stripe/Zelle fee payment submission and payment history, and academic results (`/my-results`).

### Center Coordinators
- **Center Roster:** Manage center-assigned students.
- **Manual Ordering & Appointments:** Submit manual orders and schedule center exam appointments.
- **Coordinator Reports:** Session-filtered reporting tools (`src/coordinator/`).

### Admins & Super-Admins
- **Operations & User Management:** Manage centers, coordinator invitations/assignments, credit admins, and enrolled students.
- **Payments & Fulfilment:** Review pending payment approvals, track remittances, manage manual orders, and maintain manuals catalog.
- **Configuration:** Registration settings, fee structures, and Zelle payment configuration.
- **Exam Appointments & Academic Results:** Administer exam appointments, configure academic sessions (including 10-month same-year sessions), single and bulk result uploads, score edits, corrections, analytics, and reports.

---

## Tech Stack

- **Core:** React 19, TypeScript (~5.8), Vite 6
- **UI & Styling:** Tailwind CSS v4, MUI Joy & Material Icons, React Icons, React Toastify
- **State, Routing & Forms:** Redux Toolkit & RTK Query, React Router v7, React Hook Form
- **Realtime & Utilities:** Socket.IO Client, Axios, Moment

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env.local` file in the project root with the API base URL (read via `import.meta.env.VITE_BASE_URL` in `src/data/config.ts`):

```env
VITE_BASE_URL=http://localhost:5000/api/v1
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Build the production bundle (`vite build`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npx tsc -p tsconfig.app.json --noEmit` | Run TypeScript typechecking against `tsconfig.app.json` (root `tsconfig.json` uses project references) |

---

## Project Structure

```text
school-of-disciple/
├── public/
│   └── images/                  # Official institutional logos, portraits, and page imagery
├── src/
│   ├── admin/
│   │   ├── appointments/        # Exam appointment administration & date/time scheduling
│   │   ├── configurations/      # Registration, fee, and Zelle settings
│   │   ├── coordinators/        # Coordinator directory & details
│   │   ├── credit-admin/        # Admin credit tools
│   │   ├── dashboard/           # Admin overview dashboard
│   │   ├── manage-centers/      # Center directory & assignments
│   │   ├── manual-orders/       # Manual order oversight
│   │   ├── manuals/             # Course manuals management
│   │   ├── payments/            # Transactions, remittances, and pending approvals
│   │   ├── results/             # Session setup, uploads, bulk uploads, edits, corrections, analytics & reports
│   │   └── students/            # Student directory
│   ├── coordinator/             # Coordinator reports and center views
│   ├── pages/                   # Public, auth, onboarding, student dashboard, payment & results pages
│   ├── components/              # Shared UI, layout frames, navigation, modals, and form controls
│   ├── data/                    # Redux store, RTK Query APIs, Axios config, and Socket.IO hooks
│   └── utils/                   # Route guards, status mappings, and shared helpers
├── DESIGN.md                    # Visual design tokens and component guidelines
├── PRODUCT.md                   # Product scope, roles, and UX principles
└── render.yaml                  # Render static-site SPA rewrite configuration
```

---

## Git Branching & Release Workflow

```text
feat/* | fix/* | redesign/*  ──►  dev  ──►  stage  ──►  main (production)
```

| Branch | Purpose |
|---|---|
| `main` | Live production branch (deployed automatically by Render) |
| `stage` | Pre-production QA and client UAT verification branch |
| `dev` | Active integration branch for the next release |
| `feat/*`, `fix/*`, `docs/*`, `redesign/*` | Short-lived topic branches created off `dev` (personal or experimental UI work stays on `redesign/*` until approved) |
| `archive/legacy-master` | Read-only historical archive of the legacy `master` branch |

### Common Commands

**1. Start a new feature, bugfix, or redesign from `dev`:**
```bash
git checkout dev
git pull origin dev
git checkout -b feat/<short-name>   # or fix/<name>, docs/<name>, redesign/<name>
```

**2. Merge into `dev` and promote `dev -> stage -> main`:**
```bash
# Integrate completed topic branch into dev
git checkout dev
git merge --no-ff feat/<short-name>

# Promote dev to stage for QA / client review
git checkout stage
git merge --no-ff dev
git push origin stage

# Promote stage to main for production release
git checkout main
git merge --no-ff stage
git push origin main
```

**3. Handle an urgent production hotfix:**
```bash
# Branch directly from main
git checkout main
git pull origin main
git checkout -b fix/<hotfix-name>

# After fixing and verifying, merge back into main, stage, and dev
git checkout main && git merge --no-ff fix/<hotfix-name> && git push origin main
git checkout stage && git merge --no-ff fix/<hotfix-name> && git push origin stage
git checkout dev && git merge --no-ff fix/<hotfix-name> && git push origin dev
```

---

## Deployment

The app is deployed on **Render** tracking the **`main`** branch. Client-side routing is handled by [`render.yaml`](./render.yaml), which rewrites all routes (`/*`) to `/index.html`.
