# KhoshGolpo Backend

NestJS 11 service that powers authentication and discussion threads for the KhoshGolpo application. The API uses Prisma as the ORM for MongoDB and issues access/refresh JWTs for session management.

## Tech Stack

- Node.js 20+
- NestJS 11
- Prisma ORM (MongoDB datasource)
- JWT authentication (`@nestjs/jwt`)
- Class validator/transformer for DTO validation

## Quick Start

```bash
cd backend
npm install

# configure environment variables (see below)
npm run prisma:generate
npm run start:dev
```

The API listens on `http://localhost:4000` by default.

## Environment Variables

Create `backend/.env` with at least:

```
PORT=4000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/KhoshGolpo
JWT_SECRET=<strong-random-string>
REFRESH_TOKEN_SECRET=<strong-random-string>
FRONTEND_URL=http://localhost:3000
```

Optional additions:

```
REDIS_URL=redis://...
REDIS_QUEUE_URL=redis://...
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

Refer to the shared environment template distributed with the project for a complete example.

## Prisma Workflow

- Edit models in `prisma/schema.prisma`.
- Regenerate the client with `npm run prisma:generate`.
- The generated client lives in `backend/node_modules/@prisma/client`.
- `PrismaService` (`src/prisma/prisma.service.ts`) wraps the client for DI.

## NPM Scripts

| Script | Description |
| --- | --- |
| `start` | Start NestJS without watch mode |
| `start:dev` | Development server with file watch |
| `start:prod` | Run compiled output from `dist/` |
| `start:nodemon` | Nodemon wrapper around `start:dev` |
| `build` | Compile TypeScript to `dist/` |
| `lint`, `lint:fix` | ESLint checks |
| `test`, `test:watch`, `test:cov`, `test:e2e` | Jest suites |
| `prisma:format` | Format `schema.prisma` |
| `prisma:generate` | Generate Prisma client |
| `prisma:studio` | Launch Prisma Studio |

## Project Structure

- `src/app.module.ts` – root Nest module
- `src/auth/` – Auth controllers, service, DTOs, JWT strategy
- `src/users/` – User service and Prisma logic
- `src/threads/` – Thread and post endpoints
- `src/common/` – Decorators, guards, shared utilities
- `src/prisma/` – Prisma module/service integration

Detailed workflow notes live in the internal documentation shared with the team.

## Testing

```bash
npm run test        # unit tests
npm run test:e2e    # e2e tests (configure test env first)
npm run test:cov    # coverage report
```

## Deployment Notes

- Build with `npm run build` and deploy the `dist/` folder.
- Supply the prod `.env` values (`MONGO_URI`, JWT secrets, Redis URLs).
- Regenerate Prisma client on the target platform if you deploy from a different OS/architecture.
