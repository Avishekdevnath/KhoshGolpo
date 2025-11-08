# KhoshGolpo Frontend

Next.js app that provides the web experience for KhoshGolpo. It consumes the NestJS API living in `../backend` and renders the discussion threads, auth flows, and supporting UI.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` and ensure the backend is running at `http://localhost:4000` (or update the API base URL – see below).

## Environment Variables

Create `frontend/.env.local` if you need to override defaults. Common entries:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

See `guide/environment_templates.md` for additional variables shared with the backend.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Run the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint checks |

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS (via `globals.css`)
- React Query / SWR style utilities for API calls (`src/lib/api`)

## Project Structure

- `src/app/` – Application routes and layouts
- `src/components/` – UI primitives and feature components
- `src/lib/` – API clients, auth helpers, utilities
- `public/` – Static assets

## Deployment

- Build the app with `npm run build`.
- Serve with `npm run start` or deploy to a platform such as Vercel/Netlify.
- Ensure the `NEXT_PUBLIC_API_BASE_URL` environment variable points at your deployed backend.
