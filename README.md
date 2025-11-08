# KhoshGolpo Monorepo

Combined repository for the KhoshGolpo discussion platform. The project is split into two isolated workspaces:

- `backend/` – NestJS + Prisma API for authentication and thread/post management.
- `frontend/` – Next.js application that consumes the backend.

There is no root `package.json`; each workspace manages its own dependencies.

## First-Time Repository Setup

```bash
git clone <repo-url> khoshgolpo
cd khoshgolpo
git config advice.addEmbeddedRepo false  # optional, keeps git quiet about nested folders
```

- Each workspace (`backend/`, `frontend/`) has its **own** `package.json` and `.gitignore`.
- Do **not** run `git init` inside `backend/` or `frontend/`; the monorepo is tracked from the root.
- If you accidentally added `node_modules` to version control, clean it up once with:

  ```bash
  git rm -r --cached node_modules prisma/node_modules
  ```

  After that, the ignores in the root and workspace `.gitignore` files will keep dependencies out of Git.

## Prerequisites

- Node.js 20+
- MongoDB database (for Prisma)
- Redis (optional, if you enable queue/cache features later)

## Getting Started

### Backend

```bash
cd backend
npm install

# Configure environment variables (see the shared environment template)
touch .env             # create if it does not exist
# populate the required keys before starting the server

npm run prisma:generate
npm run start:dev
```

The backend listens on `http://localhost:4000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and talks to the backend via `NEXT_PUBLIC_API_BASE_URL`.

## Environment Configuration

- Start with the environment template provided alongside the project documentation.
- Backend expects `MONGO_URI`, JWT secrets, and `FRONTEND_URL`.
- Frontend can point to the API with `NEXT_PUBLIC_API_BASE_URL`.
- Contact the maintainer for additional Prisma/NestJS guidance if needed.

## Useful Scripts

Run the following **inside** each workspace:

| Workspace | Command | Description |
| --- | --- | --- |
| backend | `npm run start:dev` | NestJS server with hot reload |
| backend | `npm run prisma:generate` | Generate Prisma client |
| backend | `npm run test` | Jest unit tests |
| frontend | `npm run dev` | Next.js development server |
| frontend | `npm run build` | Production build |
| frontend | `npm run lint` | ESLint checks |

## Maintainer Tips

- Keep `.env` files out of source control. Use the provided environment templates instead.
- When sharing workspace-specific scripts or commands, place them under the relevant `backend/` or `frontend/` README.
- Run linting/tests per workspace before pushing (`npm run lint`, `npm run test`, etc.).

## Repository Structure

```
backend/    # NestJS + Prisma API
frontend/   # Next.js UI
.gitignore
README.md
```

## Contribution Flow

1. Branch from `main`.
2. Install dependencies and make changes inside the relevant workspace.
3. Ensure `node_modules/` folders remain untracked (`git status` should be clean).
4. Run lint/tests (`npm run lint`, `npm run test`, etc.).
5. Commit with a clear message (see below).
6. Open a pull request summarising the change.

## Suggested First Commit Message

Use something descriptive like:

```
chore: import frontend and backend workspaces
```

This communicates that the initial commit captures the project structure and both applications.

---

If you need additional automation (CI, formatting configs, husky, etc.), add them in future commits once requirements stabilise.

