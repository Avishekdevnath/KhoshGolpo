# KhoshGolpo Monorepo

KhoshGolpo is a human-first discussion platform that blends AI support with thoughtful moderation tools so communities stay warm, safe, and productive. This repository hosts the full stack: a NestJS backend and a Next.js frontend managed as independent workspaces within a single monorepo project.

---

## Architecture Overview

- Two independent workspaces (`backend/`, `frontend/`) managed in a single Git repository with isolated dependency trees.
- Shared documentation and environment templates live under `guide/`; each workspace owns its own build, lint, and deployment tooling.
- Communication between tiers uses REST endpoints and Socket.IO-based realtime channels, all authenticated via JWT-bearing cookies/session tokens.

### Backend Architecture

- **Framework & Structure**: Built on NestJS 11 with modular domains (`auth`, `threads`, `notifications`, `ai`, `metrics`, `admin`, etc.). Each module encapsulates controllers, services, DTOs, and guards using Nest’s dependency injection.
- **Data Layer**: Prisma ORM targeting MongoDB. The schema models users, threads, posts, notifications, and AI audit logs. Transactions and cascading logic are orchestrated through Prisma service methods.
- **Authentication & Security**: JWT-based access and refresh tokens managed by `auth` module, with passport strategies, rate limiting, throttling guards, and cookie parsing for session continuity. Role-based access control is implemented via custom decorators/guards.
- **Background Processing**: BullMQ-backed queues for asynchronous workloads (moderation, notifications) with worker entry points in `dist/ai/ai.worker.service.js` and `dist/notifications/...`.
- **Realtime Layer**: Socket.IO gateways publish thread updates, typing indicators, and moderation events routed through Nest’s WebSocket abstraction.
- **Observability**: Terminus health checks, Prometheus metrics (`metrics` module), and optional Sentry instrumentation for tracing and error capture.
- **Configuration**: `@nestjs/config` + Joi validation centralised in `config/`. Environment variables govern database URLs, mail providers, AI keys, and CORS origins.
- **Deployment**: Dockerfile and Render deployment guides located in `backend/guide/`. Build output lives in `dist/`, launched via `npm run start:prod` or worker-specific scripts.

### Frontend Architecture

- **Framework & Routing**: Next.js 16 using the App Router. Public marketing pages live under `src/app/`, while authenticated areas mount layouts that guard routes through middleware-like client components.
- **State & Data**: Client-side data fetching handled through SWR and custom hooks in `src/lib/api/`. Forms leverage `react-hook-form` with `zod` validation.
- **UI System**: Component library in `src/components/`, broken down into layout primitives (`layout/site-navbar`, `layout/site-footer`), UI atoms (`ui/button`, `ui/input`), and domain-specific components (`threads/create-thread-modal`, auth forms).
- **Styling**: Tailwind CSS v4 (via `@tailwindcss/postcss`) with project-wide tokens set in `globals.css`. Theme supports dark mode driven by CSS variables from Next’s font utilities.
- **Auth Flow**: Login/register pages under `src/app/auth/`; redirect logic orchestrated via `AppProviders` and `auth/protected-route` component. Tokens are stored in cookies shared with backend authentication.
- **API Communication**: `src/lib/api/client.ts` centralises REST calls, reading `NEXT_PUBLIC_API_URL`. Socket.IO or other realtime hooks integrate through dedicated utilities (`src/lib/`).
- **Build & Deployment**: Next.js CLI scripts handle dev/build/start. The app can deploy to Vercel or any Node-compatible host; static assets live in `public/`.
- **Testing & Quality**: ESLint config in `eslint.config.mjs`, TypeScript strict mode enforced via `tsconfig.json`, and formatting handled through Prettier scripts.

---

## Repository Structure

### Backend

```
backend/
├── src/
│   ├── admin/               # Admin dashboards and controllers
│   ├── ai/                  # AI moderation services & queues
│   ├── auth/                # JWT strategies, guards, controllers
│   ├── notifications/       # Email, websocket, and queue handlers
│   ├── posts/threads/       # Core discussion domain logic
│   ├── realtime/            # Socket.IO gateways and events
│   ├── metrics/             # Prometheus exporters, health checks
│   └── main.ts              # Nest bootstrap entry point
├── prisma/                  # Prisma schema, migrations, seed scripts
├── scripts/                 # Utility scripts (e.g., webhook test harness)
├── dist/                    # Compiled output after `npm run build`
├── Dockerfile
└── package.json
```

### Frontend

```
frontend/
├── src/
│   ├── app/                 # Next.js routes, layouts, and pages
│   ├── components/          # Reusable UI, layout, domain components
│   ├── lib/                 # API client, config, hooks, utilities
│   └── styles/              # Global styles (if additional CSS modules)
├── public/                  # Static assets (icons, images)
├── next.config.ts
└── package.json
```

> Additional planning documents and environment templates live outside these workspaces and are intentionally omitted here per request.

---

## System Design Highlights

- **AI-Powered Moderation**  
  - Moderation queue leverages OpenAI via `ai` module. Content posted through threads is enqueued, scored, and either auto-approved, rewritten with empathetic phrasing, or escalated for human review.  
  - Results feed back into Prisma via audit logs and notify moderators through the notifications module. Workers (`npm run start:worker:moderation`) can be scaled independently.
- **Realtime Collaboration**  
  - Socket.IO gateways in `realtime/` broadcast thread updates, typing indicators, and moderation outcomes. Clients subscribe through the frontend’s `lib/api` utilities, ensuring immediate UI updates without page refreshes.  
  - Presence and typing signals are throttled through Redis when available; without Redis, the backend falls back to in-memory broadcasting for local development.
- **Notification System**  
  - BullMQ jobs dispatch email/push notifications for mentions, approvals, and moderation escalations. Templates align with `FRONTEND_URL` to deep-link users back into threads.  
  - Webhooks (see `scripts/local-notification-webhook.ts`) allow integration with external channels such as Slack.
- **Security & Observability**  
  - JWT auth with refresh flow, role-based decorators, and throttling guard API abuse.  
  - Metrics module exposes Prometheus counters for request latency, worker health, and AI moderation throughput; Terminus endpoints integrate with uptime monitors.

These subsystems combine to keep conversations safe while preserving the immediacy and warmth of human dialogue.

---

## Feature Overview

- **Threaded Conversations**  
  Organise discussions into threads with nested posts and replies. Users can start new conversations, mention peers, and keep context through realtime updates streamed via Socket.IO.

- **AI-Assisted Summaries & Tone Coaching**  
  AI services generate concise summaries for long-running discussions, surface key decisions, and coach users toward empathetic language before messages are published.

- **Advanced Moderation**  
  Automated sentiment and safety checks flag risky content for review. Moderators receive actionable insights, suggested responses, and escalation workflows with full audit history.

- **Notification Center**  
  BullMQ-backed jobs deliver email, in-app, and webhook notifications for mentions, approvals, and moderation outcomes. Users control digest frequency and channels.

- **Analytics & Insights**  
  Metrics module captures engagement trends, sentiment scores, and participation metrics. Admin dashboards surface heat maps, growth funnels, and AI throughput telemetry.

- **Access Control & Security**  
  JWT-based auth with role-aware guards, rate limiting, and multi-factor-ready hooks ensures that sensitive areas (admin tools, moderation panel) remain protected.

- **Customisable Landing Experience**  
  The Next.js frontend includes a polished public home page with marketing content, feature highlights, FAQs, and conversion-friendly CTAs for onboarding new communities.

---

## Live Environments

- **Frontend**: https://khoshgolpo-v1.vercel.app/
- **Backend**: https://khoshgolpo.onrender.com
- **API Docs (Swagger)**: https://khoshgolpo.onrender.com/docs

---

## Prerequisites

- Node.js **20.x** (with npm)
- MongoDB instance reachable by the backend (local container, Atlas, etc.)
- Redis (optional) for queues, caches, and websocket scaling; the backend can start without it but some features degrade
- Recommended: Docker Desktop for container workflows and deployment parity

---

## Setup Instructions

Clone the monorepo and switch into it:

```bash
git clone <repo-url> khoshgolpo
cd khoshgolpo
```

> ℹ️ The Git repository is rooted here; do **not** re-initialize Git inside `backend/` or `frontend/`. Each workspace ignores its own `node_modules/`.

### Backend Workspace

```bash
cd backend
npm install

# copy environment template (adjust path if templates move)
cp ../guide/environment_templates/backend.env.example .env
# fill in MongoDB, JWT, mail, and OpenAI credentials

npm run prisma:generate   # build Prisma client
```

Key environment variables:

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string used by Prisma |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Token signing keys |
| `OPENAI_API_KEY` | Enables AI moderation features |
| `FRONTEND_URL` | Configures CORS and email template links |
| `REDIS_URL` (optional) | Needed for background workers, queues, and throttling |

### Frontend Workspace

```bash
cd frontend
npm install

cp ../guide/environment_templates/frontend.env.example .env.local
# set NEXT_PUBLIC_API_URL to point at the backend (defaults to http://localhost:4000)
```

Key environment variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL for all API calls (HTTP & websocket) |

---

## Running the Project

### Development Mode
Run backend and frontend in separate terminals:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev          # http://localhost:4000

# Terminal 2 - Frontend
cd frontend
npm run dev                # http://localhost:3000
```

The frontend expects the backend at `http://localhost:4000` unless overridden via `NEXT_PUBLIC_API_URL`.

### Production Preview

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run start
```

### Useful Scripts

| Workspace | Command | Description |
| --- | --- | --- |
| backend | `npm run start:dev` | NestJS dev server with hot reload |
| backend | `npm run test` | Run Jest unit tests |
| backend | `npm run lint` | ESLint checks for backend code |
| backend | `npm run start:worker:*` | Launch background workers (moderation, notifications, etc.) |
| frontend | `npm run dev` | Next.js dev server |
| frontend | `npm run lint` | ESLint checks for frontend code |
| frontend | `npm run build` | Production bundle |
| frontend | `npm run test` | Vitest + Testing Library smoke tests |
| backend | `npm run test:cov` | Jest test suite with focused coverage instrumentation |

See `docs/test-plan.md` for the current coverage matrix across both applications.

---

## Docker & Compose

To spin up the entire stack (API, workers, frontend, MongoDB, Redis) with one command:

```bash
docker compose up --build
```

Required files:

- `backend/.env` – backend credentials (MongoDB, JWT, Redis, OpenAI, etc.)
- `frontend/.env.local` – set `NEXT_PUBLIC_API_URL=http://api:4000`

The compose file builds images from the local Dockerfiles. Workers reuse the backend image and will only start successfully when Redis/Mongo are reachable.

---

## Deployment Notes

- Docker and Render guides are located in `backend/guide/` (for example `docker_deployment.md`, `render_deployment.md`).
- Ensure `FRONTEND_URL`, `BACKEND_URL`, and required secrets are configured in the target platform; Prisma migrations should run against the production database before deploying the backend build.
- Background workers (`npm run start:worker:*`) can be scaled separately when Redis is available.

---

## Assumptions & Trade-offs

- **Workspace isolation** – Separate dependency trees avoid toolchain clashes (Nest vs. Next) but require duplicate install steps.
- **MongoDB + Prisma** – Optimised for flexible, document-style thread storage; complex relational behaviour is handled in application logic instead of relying on SQL joins.
- **Optional Redis** – The system operates without Redis in local development, sacrificing queue-driven features and rate limiting; production environments should include Redis for full functionality.
- **AI dependency** – Moderation and summarisation rely on third-party APIs (OpenAI). Lack of credentials gracefully falls back to manual workflows but reduces automated oversight.
- **Manual process orchestration** – Services start individually rather than via a root script; keeps responsibilities explicit but adds friction. A future improvement could introduce a root task runner if desired.

---

## Contribution Workflow

1. Branch from `main`.
2. Work inside the relevant workspace; keep `node_modules/` out of Git.
3. Update `.env.example` files when introducing new configuration keys.
4. Run lint/tests for the areas you touch (`npm run lint`, `npm run test`, etc.).
5. Commit using conventional messages (e.g., `feat: add thread moderation API`).
6. Open a pull request summarising intent, testing, and any deployment steps.

Refer to the detailed plans, environment templates, and feature blueprints in the `guide/` directory for domain-specific context.

---

## Continuous Integration

- `.github/workflows/backend-ci.yml` – installs backend dependencies, runs lint/tests/coverage, and (optionally) pings a Render deploy hook when `RENDER_DEPLOY_HOOK_URL` is provided.
- `.github/workflows/frontend-ci.yml` – installs frontend dependencies, runs lint/build/tests, and (optionally) triggers a Vercel deploy hook via `VERCEL_DEPLOY_HOOK_URL`.

Both workflows cache npm installs and run on pushes/pull requests that touch their respective workspaces.

---

Happy building—and keep the conversations warm! 😊


