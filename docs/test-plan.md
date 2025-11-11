# Test Coverage Plan

## Backend (NestJS)

| Area | Scenarios | Approach |
| --- | --- | --- |
| Authentication | register → login → refresh, refresh failures, cookie handling | Unit tests with mocked services (`auth.service.spec.ts`) plus e2e happy-path via `test/app.e2e-spec.ts` |
| Threads | Query DTO validation (pagination), cache behaviour on list endpoints | Unit tests for DTO parsing (`threads/dto/list-threads.query.spec.ts`) plus cache-aware service tests |
| Notifications | REST controller coverage (list/mark read) | Existing Swagger metadata validated; future integration tests to use SuperTest against running app |
| Health/Metrics | Health endpoint | Basic e2e check already provided in `app.e2e-spec.ts` |

> Integration tests requiring MongoDB/Redis will run via `npm run test:e2e` with services available (locally or dockerised).

## Frontend (Next.js)

| Area | Scenarios | Approach |
| --- | --- | --- |
| Public Marketing | Hero section renders headline, CTA routes, metrics | Vitest + RTL snapshotless tests |
| Navigation | Navbar shows brand, nav links, auth CTAs | Vitest + RTL |
| Auth Flows | Form validation, redirects (pending) | Future tests will mock API client |
| Thread Workspace | Protected layout rendering, create modal (todo) | To be covered in subsequent iterations once data hooks stabilise |

## Tooling

- **Backend**: Jest (`npm run test`, `npm run test:cov`, `npm run test:e2e`)
- **Frontend**: Vitest + Testing Library (`npm run test`)

Coverage reporting is captured via `npm run test:cov` for backend; frontend focuses on behaviour assertions and can adopt `vitest --coverage` when additional suites land.

