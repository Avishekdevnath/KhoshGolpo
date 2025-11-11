# KhoshGolpo Backend

NestJS 11 service that powers authentication, moderation, realtime conversations, and notifications for the KhoshGolpo platform. The API is backed by Prisma (MongoDB), issues short-lived JWT access tokens, and queues AI moderation workloads for asynchronous review.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Summary](#architecture-summary)
   - [High-Level Flow](#high-level-flow)
   - [Module Breakdown](#module-breakdown)
   - [Data Stores & Integrations](#data-stores--integrations)
   - [Background Workers](#background-workers)
3. [Directory Structure](#directory-structure)
4. [Tech Stack](#tech-stack)
5. [Environment & Configuration](#environment--configuration)
6. [Setup & Local Development](#setup--local-development)
7. [API Reference](#api-reference)
   - [Auth](#auth)
   - [Users](#users)
   - [Threads & Posts](#threads--posts)
   - [Notifications](#notifications)
   - [Admin APIs](#admin-apis)
   - [Health & Metrics](#health--metrics)
   - [Root](#root)
8. [Testing](#testing)
9. [Deployment Notes](#deployment-notes)

---

## Overview

- **Purpose**: Serve the REST + websocket backend for KhoshGolpo’s AI-assisted discussion platform.
- **Primary Responsibilities**: Authentication, thread/post management, AI moderation pipeline, notification delivery, admin tooling, metrics, and health probes.
- **Port**: `http://localhost:4000` (configurable via `PORT`).

---

## Architecture Summary

### High-Level Flow

1. **Client Request** → HTTP request enters NestJS controller (`@Controller`) layer.
2. **Guards & Interceptors** → JWT guard/role guard, throttlers, and logging interceptors run.
3. **Service Layer** → Business logic executes in injectable services (e.g., `ThreadsService`).
4. **Data Access** → Prisma service persists to MongoDB. Transactions are orchestrated explicitly where required.
5. **Async Pipelines** → Key events (new posts, moderation decisions, notification triggers) publish jobs onto BullMQ queues handled by workers.
6. **Realtime Broadcast** → Changes propagate through Socket.IO gateways to subscribed clients.
7. **Monitoring** → Metrics and structured logs capture request and worker performance.

### Module Breakdown

- `auth` – Registration, login, refresh tokens, email verification, password hashing, device sessions.
- `users` – Profile management and user lookup helpers.
- `threads` & `posts` – Thread CRUD, post creation, pagination, moderation states, admin overrides.
- `notifications` – User notification preferences, queue-driven delivery, read receipts.
- `ai` – Moderation policy engine, OpenAI client wrapper, score storage, worker entry points.
- `realtime` – Socket.IO gateways for thread updates, presence, and notification badges.
- `metrics` – Prometheus exporter, HTTP request counters/latency histograms.
- `health` – Terminus-based health indicator (currently Prisma/Mongo connectivity).
- `admin` – Admin + moderator dashboards for users, security events, moderation queues, forced logouts.
- `common` – Cross-cutting utilities (decorators, guards, pipes) and exception filters.
- `queue`/`cache` – Redis-backed queues/cache clients (optional in development).

### Data Stores & Integrations

- **MongoDB (via Prisma)** – Primary data store for users, threads, posts, audit logs, notifications, moderation events.
- **Redis (BullMQ)** – Queues for moderation and notification workers; optional caching for rate limiting and presence.
- **OpenAI** – AI moderation and summarisation. Missing credentials degrade gracefully to manual moderation.
- **SMTP / Mail Provider** – Email verification and notification digests through Nodemailer.
- **Sentry (optional)** – Error tracing when `SENTRY_DSN` provided.

### Background Workers

- `npm run start:worker:moderation` → consumes moderation queue, calls AI provider, writes back scores/actions.
- `npm run start:worker:notifications` → sends emails/webhooks/push notifications, updates delivery status.
- Workers share the same Nest application context but run without HTTP listeners for horizontal scaling.

---

## Directory Structure

```
backend/
├── src/
│   ├── admin/                # Admin controllers, DTOs, services
│   ├── ai/                   # AI moderation services and worker bootstrap
│   ├── auth/                 # Auth controllers, services, strategies, DTOs
│   ├── cache/                # Redis caching utilities
│   ├── common/               # Decorators, guards, filters, interceptors
│   ├── config/               # Config schemas & validation
│   ├── health/               # Terminus health checks
│   ├── mail/                 # Mailer module integrations
│   ├── metrics/              # Prometheus metrics exporter
│   ├── notifications/        # Notification domain (REST + queues)
│   ├── posts/                # Post schemas and helpers
│   ├── prisma/               # Prisma module/service integrations
│   ├── queue/                # BullMQ queue providers
│   ├── realtime/             # Socket.IO gateway definitions
│   ├── threads/              # Thread controllers, DTOs, services
│   ├── users/                # User controller/service
│   └── main.ts               # Application bootstrap
├── prisma/
│   ├── schema.prisma         # Prisma schema targeting MongoDB
│   └── migrations/           # Generated migrations (if enabled)
├── dist/                     # Compiled output after `npm run build`
├── scripts/                  # Utility scripts (e.g., webhook tester)
├── Dockerfile
└── package.json
```

---

## Tech Stack

- Node.js 20+
- NestJS 11 with `@nestjs/config`, `@nestjs/swagger`, `@nestjs/terminus`, `@nestjs/platform-socket.io`
- Prisma ORM (MongoDB datasource)
- BullMQ (Redis) for queues and background workers
- JWT (`@nestjs/jwt`) with cookie-based refresh tokens
- Class-validator / class-transformer for DTOs
- Pino logging (via `nestjs-pino`)

---

## Environment & Configuration

Create `backend/.env` with the following minimum values:

```
PORT=4000
DATABASE_URL="mongodb+srv://<user>:<pass>@cluster.mongodb.net/KhoshGolpo"
MONGO_URI=${DATABASE_URL}
JWT_ACCESS_SECRET="<strong-random-string>"
JWT_REFRESH_SECRET="<strong-random-string>"
FRONTEND_URL="http://localhost:3000"
OPENAI_API_KEY="<openai-api-key>"
MAIL_HOST="smtp.example.com"
MAIL_USER="example@example.com"
MAIL_PASS="<smtp-password>"
NOTIFICATION_WEBHOOK_URL="https://example.com/webhooks/notifications"
NOTIFICATION_WEBHOOK_SECRET="<shared-secret-used-by-worker>"
```

Optional:

```
REDIS_URL="redis://localhost:6379"
REDIS_QUEUE_URL="redis://localhost:6380"
SENTRY_DSN="https://example.ingest.sentry.io/1234"
LOG_LEVEL="info"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
```

Validation for these values is enforced in `src/config/config.validation.ts`.

---

## Setup & Local Development

```bash
cd backend
npm install

# generate Prisma client
npm run prisma:generate

# run with live reload
npm run start:dev
```

The API listens on `http://localhost:4000` by default.

### Useful NPM Scripts

| Script | Description |
| --- | --- |
| `build` | Compile TypeScript to `dist/` |
| `start` | Start compiled app without watch |
| `start:dev` | Development server with watch (ts-node) |
| `start:prod` | Run compiled production bundle |
| `start:worker:moderation` | Launch AI moderation worker |
| `start:worker:notifications` | Launch notification worker |
| `lint`, `lint:fix` | ESLint checks |
| `test`, `test:watch`, `test:cov`, `test:e2e` | Jest suites |
| `prisma:generate` | Regenerate Prisma client |
| `prisma:studio` | Open Prisma Studio |
| `prisma:format` | Format Prisma schema |

---

## API Reference

Swagger decorators are embedded throughout the controllers. Run the app and visit `http://localhost:4000/api/docs` (if Swagger module enabled) or reference the summary below.

### Auth

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | None | Create a new user and send verification email. |
| POST | `/auth/login` | None | Exchange credentials for access & refresh tokens (refresh token set as HTTP-only cookie). |
| POST | `/auth/refresh` | Refresh cookie | Rotate access/refresh tokens using refresh cookie. |
| POST | `/auth/logout` | Refresh cookie | Revoke refresh token, clear auth cookies. |
| GET | `/auth/verify-email` | Token query | Verify email using token pair, returns fresh tokens. |
| GET | `/auth/me` | Bearer access token | Retrieve current user profile. |

**Register request**

```json
POST /auth/register
{
  "email": "amina@example.com",
  "handle": "amina",
  "password": "Sup3rSecure!"
}
```

### Users

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| PATCH | `/users/me` | Bearer access token | Update authenticated user profile (display name, bio, avatar URL, locale, etc.). |
| GET | `/users/search` | Bearer access token | Search users by handle/display name; supports `query`, `limit`, `status`, `role`. |
| GET | `/users/me/threads` | Bearer access token | Paginated list of threads authored by the current user (`page`, `limit`, `status`). |
| GET | `/users/:userId/threads` | Optional | Paginated list of threads authored by the specified user. |

Request payload mirrors `UpdateProfileDto`. Fields are optional and validated via class-validator.

### Threads & Posts

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/threads` | Optional | Paginated list of threads. Supports `page`, `limit`, `status`. |
| GET | `/threads/search` | Optional | Search threads by keyword (`q`), tag (`tag`), and status with pagination. |
| POST | `/threads` | Bearer access token | Create a thread and initial post. Triggers AI moderation + realtime broadcast. |
| GET | `/threads/:threadId` | Optional | Fetch thread detail with paginated posts (`page`, `limit`). |
| POST | `/threads/:threadId/posts` | Bearer access token | Add a post to an existing thread. Publishes notifications and moderation job. |
| PATCH | `/threads/:threadId/archive` | Bearer access token | Archive a thread you own (status set to `archived`). |
| PATCH | `/threads/:threadId/unarchive` | Bearer access token | Re-open an archived thread you own (status set to `open`). |
| DELETE | `/threads/:threadId` | Bearer access token | Delete a thread you own (removes all posts). |

**Create thread request**

```json
POST /threads
Authorization: Bearer <access>
{
  "title": "How do we roll out the new empathy toolkit?",
  "body": "Looking for feedback on the v2 moderation playbook.",
  "tags": ["moderation", "playbook"]
}
```

### Notifications

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/notifications` | Bearer access token | List notifications for current user (paginated; supports `page`, `limit`, `status`). |
| PATCH | `/notifications/:notificationId/read` | Bearer access token | Mark a single notification as read. |
| PATCH | `/notifications/read-all` | Bearer access token | Mark all notifications as read for the current user. |

### Admin APIs

> All admin routes require a valid access token **and** `admin` or `moderator` role. Guards: `JwtAuthGuard` + `RolesGuard`.

#### Admin • Users (`/admin/users`)

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| GET | `/admin/users` | admin | Paginated user list with filters (role, status, query). |
| PATCH | `/admin/users/:userId/roles` | admin | Update a user’s roles. |
| PATCH | `/admin/users/:userId/status` | admin | Update user status (active/suspended/banned). |
| POST | `/admin/users/:userId/logout` | admin | Invalidate all sessions for a user. |

#### Admin • Moderation (`/admin/moderation`)

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| GET | `/admin/moderation/posts` | admin, moderator | List posts awaiting moderation review. |
| GET | `/admin/moderation/threads` | admin, moderator | List threads filtered by moderation status. |

#### Admin • Threads (`/admin/threads`, `/admin/posts`)

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| PATCH | `/admin/threads/:threadId/status` | admin, moderator | Update moderation status (approved, flagged, locked). |
| PATCH | `/admin/posts/:postId/moderation` | admin, moderator | Moderate a post, optionally lock its thread. |

#### Admin • Security (`/admin/security`)

| Method | Endpoint | Roles | Description |
| --- | --- | --- | --- |
| GET | `/admin/security/events` | admin, moderator | Paginated security events (login failures, suspicious activity). |
| GET | `/admin/security/rate-limit` | admin, moderator | Aggregated rate-limit violations grouped by IP / user / endpoint. |

### Health & Metrics

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | None | Terminus health probe (MongoDB connectivity). |
| GET | `/metrics` | Optional | Prometheus metrics (content-type `text/plain`). Typically scraped by infra tooling. |

### Root

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/` | None | Simple welcome string from `AppService`. Useful for smoke tests. |

---

## Testing

```bash
npm run test         # unit tests
npm run test:watch   # watch mode
npm run test:e2e     # e2e tests (configure dedicated test DB)
npm run test:cov     # focused coverage report (auth services + thread DTO)
```

Tests rely on Jest with ts-jest transformers. E2E suite boots a Nest testing module and can target an isolated MongoDB database. Coverage instrumentation is intentionally scoped to the authentication service, thread pagination DTO, and utility helpers; see `docs/test-plan.md` for the current matrix.

GitHub Actions (`.github/workflows/backend-ci.yml`) runs lint, unit tests, coverage, and optionally pings a Render deploy hook when `RENDER_DEPLOY_HOOK_URL` is supplied.

---

## Deployment Notes

- Build with `npm run build` and deploy the contents of `dist/`.
- Ensure production environment variables are set (`DATABASE_URL`, JWT secrets, Redis URLs, mail/OpenAI credentials).
- Prisma client is OS-specific; regenerate on the target platform if deploying from a different architecture.

### Render Blueprint & GitHub Actions

The repository includes `render.yaml` and GitHub workflow automation:

1. Push the repository to GitHub.
2. In Render, create a **Blueprint** deployment pointing to the repo/branch.
3. Populate required secrets after initial deploy (MongoDB, Redis, JWT, OpenAI, mail, webhook URLs).
4. Configure `RENDER_DEPLOY_HOOK_URL` in repository secrets to enable automatic redeploys from CI.

---

For deeper design docs (event schemas, moderation policy, notification templates), refer to the project-wide `guide/` directory. This README focuses on the service implementation and API contract. Happy shipping! 🚀


