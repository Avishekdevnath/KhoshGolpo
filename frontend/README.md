# KhoshGolpo Frontend

Next.js 16 application that delivers the public marketing site and authenticated product experience for the KhoshGolpo platform. It consumes the NestJS backend (`../backend`) via REST and realtime channels, providing AI-assisted community tooling in the browser.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Summary](#architecture-summary)
   - [High-Level Flow](#high-level-flow)
   - [Routing & Layouts](#routing--layouts)
   - [Data & State](#data--state)
   - [Styling & Theming](#styling--theming)
   - [Integration Points](#integration-points)
3. [Directory Structure](#directory-structure)
4. [Feature Surface](#feature-surface)
5. [Tech Stack](#tech-stack)
6. [Environment & Configuration](#environment--configuration)
7. [Setup & Local Development](#setup--local-development)
8. [Available Scripts](#available-scripts)
9. [Testing & Quality](#testing--quality)
10. [Deployment Notes](#deployment-notes)

---

## Overview

- **Purpose**: Render the KhoshGolpo experience—marketing site, onboarding flows, thread dashboards, admin tools, notifications, and moderation UI.
- **Runtime**: Next.js App Router with mixed server/client components.
- **Backend Dependency**: API calls point to the NestJS service (defaults to `https://khoshgolpo.onrender.com` locally overrideable).

---

## Architecture Summary

### High-Level Flow

1. **Routing** – Next.js App Router resolves the incoming request to a layout and page component under `src/app/`.
2. **Providers** – `AppProviders` wraps client areas with context for theme, SWR cache, and authentication redirect logic.
3. **Data Fetching** – Server components fetch data via `apiFetch` helpers or `fetch`; client components use SWR-style hooks or mutate via forms.
4. **State Synchronisation** – Auth tokens persist in cookies. Client calls include credentials for refresh-token rotation.
5. **Realtime Updates** – Realtime hooks (Socket.IO) subscribe to backend events using `env.socketUrl`, enabling live thread updates and notification badges (scaffolded for future expansion).

### Routing & Layouts

- `(app)` segment hosts authenticated product surfaces:
  - `/threads`, `/threads/[threadId]`, `/notifications`, `/dashboard`, `/profile`
  - `/admin/...` subsections provide admin, moderation, and security tooling.
- `(auth)` segment contains standalone auth pages (login, register, forgot password) with lighter layouts.
- Marketing routes (`/`, `/features`, `/community-circles`, `/docs`, `/contact`, etc.) live at the root for SEO-friendly public pages.
- Global layout (`src/app/layout.tsx`) injects fonts, theming classes, and root providers.

### Data & State

- `src/lib/api/client.ts` – Fetch wrapper with typed responses, error handling, and automatic credential forwarding.
- `src/lib/config/env.ts` – Normalised environment configuration for HTTP and websocket endpoints along with routing defaults.
- `react-hook-form` + `zod` – Power client-side form validation (e.g., auth forms, thread creation).
- Local component state (React hooks) handles UI interactions; SWR or custom hooks manage remote state consistency.

### Styling & Theming

- Tailwind CSS v4 (via `postcss`) establishes design tokens through `globals.css`.
- Dark mode supported by CSS variables tied to font utilities (`Geist` family).
- Custom components composed via utility classes with additional animations and gradients for hero sections.

### Integration Points

- **REST API** – Auth, thread, notification requests use `apiFetch` to hit backend endpoints.
- **Socket.IO** – `env.socketUrl` reserved for realtime connections (typing indicators, live updates).
- **Marketing Assets** – Static SVGs served from `public/`.
- **Future Analytics** – Ready for embedding analytics scripts through root layout head tags.

---

## Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (app)/              # Authenticated product surface
│   │   │   ├── dashboard/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   ├── threads/        # Threads list + detail routes
│   │   │   └── admin/          # Admin dashboards (users, moderation, security)
│   │   ├── (auth)/             # Authentication flows
│   │   ├── features/, docs/, ... # Public marketing pages
│   │   └── layout.tsx          # Global layout + providers
│   ├── components/
│   │   ├── layout/             # Site nav, footer, app chrome
│   │   ├── home/               # Landing page sections & context
│   │   ├── auth/               # Auth redirects, forms, guards
│   │   ├── threads/            # Thread creation modal & UI
│   │   └── ui/                 # Generic inputs, buttons, cards
│   ├── lib/
│   │   ├── api/                # HTTP client helpers
│   │   ├── config/             # Env + app configuration
│   │   └── utils/              # Shared utilities (e.g., classNames)
│   └── styles/ (optional)      # Additional styling modules
├── public/                     # Static assets (icons, images)
├── next.config.ts              # Next.js configuration
├── eslint.config.mjs           # ESLint setup
└── package.json
```

---

## Feature Surface

- **Public Landing Experience** – Hero, features, community testimonials, FAQs, and CTA flows to showcase AI-driven moderation.
- **Authentication** – Register, login, forgot-password flows using `react-hook-form` with inline validation and auth guards.
- **Thread Workspace** – Thread list, detail view, and creation modal integrated with backend APIs. Prepared for realtime updates and moderation status badges.
- **Notification Center** – Event list with unread states and mark-as-read actions (REST integrated via backend endpoints).
- **Admin Console** – Users, moderation, and security dashboards under `/app/admin` for privileged roles.
- **Profile & Dashboard** – Personal settings, overview metrics, and quick links under `/app/profile` and `/app/dashboard`.
- **Marketing Microsites** – Additional informational routes (`/community-circles`, `/moderation-studio`, `/story`, etc.) to support go-to-market needs.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS v4, custom CSS variables
- **Forms & Validation**: `react-hook-form`, `zod`
- **Data Fetching**: Native `fetch`, SWR-like patterns, custom API client
- **State/Context**: React context providers, server components
- **Linting/Formatting**: ESLint 9, Prettier 3, TypeScript strict mode

---

## Environment & Configuration

Create `frontend/.env.local` (or use system env vars) to override defaults:

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL for backend REST requests | `https://khoshgolpo.onrender.com` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO endpoint for realtime updates | `https://khoshgolpo.onrender.com` |

> Trailing slashes are stripped automatically. Ensure values point to your backend deployment when running locally (`http://localhost:4000`).

---

## Setup & Local Development

```bash
cd frontend
npm install

# launch local dev server (http://localhost:3000)
npm run dev
```

Development tips:

- Run the backend (`npm run start:dev` in `../backend`) so authenticated flows and API calls function.
- Update `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SOCKET_URL` if backend runs on a different host/port.
- Hot reload is enabled; editing files under `src/` refreshes the page automatically.

---

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server. |
| `npm run build` | Produce a production build in `.next/`. |
| `npm run start` | Run the production server (after `build`). |
| `npm run lint` | Execute ESLint with zero-warning policy. |
| `npm run lint:fix` | Auto-fix lint issues where possible. |
| `npm run format` | Format source with Prettier. |
| `npm run format:check` | Verify formatting without applying changes. |
| `npm run test` | Vitest + Testing Library smoke tests. |

---

## Testing & Quality

- **ESLint** enforces coding standards (React, Next.js, Tailwind plugins).
- **TypeScript** runs in strict mode; type errors fail builds.
- **Vitest + Testing Library** provide component smoke tests (see `src/components/**/__tests__`). Run with `npm run test`.
- **Manual Testing**: Use Next.js preview URL or `npm run dev` for interactive QA.
- Future enhancements will expand automated coverage to authenticated flows and thread interactions.

GitHub Actions (`.github/workflows/frontend-ci.yml`) runs lint, build, and tests on every push/PR to the frontend workspace and optionally hits a Vercel deploy hook when `VERCEL_DEPLOY_HOOK_URL` is configured.

---

## Deployment Notes

- Generate a production build via `npm run build`; serve with `npm run start` or deploy to a platform like Vercel/Netlify.
- Ensure environment vars (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`) match the deployed backend.
- For static asset caching, configure hosting platform to cache `/public` assets aggressively while respecting Next.js headers for dynamic routes.
- `frontend/Dockerfile` builds a production-ready image; the root `docker-compose.yml` can boot both services locally alongside MongoDB and Redis.

---

For deeper UX specs, content strategy, and design tokens, refer to the shared documentation in the project `guide/` directory. This README focuses on the implementation details necessary to work on the frontend codebase. Happy shipping! ✨


