# ClientPulse

ClientPulse is a polished weekend MVP for a small consulting or development agency. It gives a team a simple portal for tracking clients, projects, requests, and comments while demonstrating a production-minded React/Next.js + NestJS + PostgreSQL stack.

## Why This Exists

This project is built to show practical full-stack engineering skills without overbuilding. It focuses on clean REST API design, relational data modeling, DTO validation, TypeScript, frontend state boundaries, local Docker development, CI, and readable documentation.

## Tech Stack

- Frontend: Next.js App Router, React, TypeScript, plain CSS
- Backend: NestJS, TypeScript, REST controllers, DTO validation
- Database: PostgreSQL
- ORM: Prisma with checked-in migrations
- Local development: Docker Compose for PostgreSQL
- Testing: Jest backend unit tests
- CI: GitHub Actions
- Package manager: npm workspaces

## Features

- Dashboard summary for request volume, status, and high-priority work
- Client list, creation form, and client detail pages
- Project list and creation flow scoped to each client
- Request list and creation flow scoped to each project
- Request filtering by status, priority, search text, and updated date sort
- Request detail page with status and priority updates
- Comments with internal/external distinction
- Audit events for request creation and status/priority updates
- Demo user header instead of full authentication
- Minimal square-edged design system with light/dark mode

## Architecture

The repository is one product with two framework-native projects:

```text
client-pulse/
  client/    Next.js App Router frontend
  server/    NestJS API, Prisma schema, migrations, seed data
```

The frontend calls the API through `NEXT_PUBLIC_API_URL`. The backend reads `DATABASE_URL`, validates DTOs with Nest's global `ValidationPipe`, and defaults the demo actor to `demo@example.com` when `X-Demo-User` is missing.

## Design System

The UI uses plain CSS variables in `client/src/app/globals.css`.

- No rounded borders
- No card shadows
- Soft black, off-white, and grey base palette
- Restrained status and priority colors
- Light/dark mode follows system preference by default
- The theme toggle stores explicit light/dark choices in local storage

## Database Schema

Core models:

- `Client`: agency client and primary contact
- `Project`: belongs to a client and has `ACTIVE`, `PAUSED`, or `COMPLETE` status
- `Request`: belongs to a project with status, priority, type, creator, and assignee
- `Comment`: belongs to a request and can be internal or external
- `AuditEvent`: records request creation and status/priority changes

Important indexes are included for project lookup, request filtering, updated date sorting, and audit lookup.

## API Endpoints

- `GET /health`
- `GET /clients`
- `POST /clients`
- `GET /clients/:id`
- `PATCH /clients/:id`
- `DELETE /clients/:id`
- `GET /clients/:clientId/projects`
- `POST /clients/:clientId/projects`
- `GET /projects/:id`
- `PATCH /projects/:id`
- `DELETE /projects/:id`
- `GET /projects/:projectId/requests`
- `POST /projects/:projectId/requests`
- `GET /requests/:id`
- `PATCH /requests/:id`
- `DELETE /requests/:id`
- `GET /requests/:requestId/comments`
- `POST /requests/:requestId/comments`
- `GET /dashboard/summary`

Request list filters:

```text
GET /projects/:projectId/requests?status=NEW&priority=HIGH&search=export&sort=updatedAt_desc
```

## Local Setup

Install dependencies:

```bash
npm install
```

Create env files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

Start PostgreSQL. The container maps PostgreSQL to host port `5433` so it does not conflict with a local Postgres already using `5432`:

```bash
docker compose up -d
```

If your machine uses the legacy Compose binary:

```bash
docker-compose up -d
```

If you already started the database before this project used port `5433`, recreate the container so Docker applies the current port mapping:

```bash
docker-compose up -d --force-recreate
```

Generate Prisma Client, run migrations, and seed sample data:

```bash
npm run prisma:generate --workspace server
npm run prisma:migrate --workspace server
npm run seed --workspace server
```

Start the API:

```bash
npm run start:dev --workspace server
```

Start the frontend in a second terminal:

```bash
npm run dev --workspace client
```

Open:

- Frontend: `http://localhost:3000`
- API health: `http://localhost:4000/health`

## Common Commands

```bash
npm run typecheck --workspace client
npm run build --workspace client
npm run test --workspace server
npm run build --workspace server
```

Root helpers:

```bash
npm run dev:client
npm run dev:server
npm run test
npm run build
```

## CI

GitHub Actions runs on pushes to `main` and pull requests.

- Frontend job: install, typecheck, build
- Backend job: install, Prisma generate, test, build

The CI workflow lives in `.github/workflows/ci.yml`.

## Public Deployment

ClientPulse is set up for a live full-stack public demo with:

- Vercel project `clientpulse-web` for the Next.js app in `client/`
- Vercel project `clientpulse-api` for the NestJS API in `server/`
- Neon Postgres for production data
- GitHub Actions for checks, migrations, seeding, and Vercel CLI deployments

The deploy workflow lives in `.github/workflows/deploy.yml`.

### Publish to GitHub

Initialize the repository and push it to a public GitHub repo:

```bash
git init -b main
git add .
git commit -m "Initial ClientPulse MVP"
```

Create a public repo named `client-pulse` on GitHub, then add the remote:

```bash
git remote add origin git@github.com:<your-github-username>/client-pulse.git
git push -u origin main
```

Before committing, verify these stay untracked:

- `.env`
- `server/.env`
- `client/.env.local`
- `.vercel`
- `node_modules`
- `.next`
- `dist`

### Neon

Create a Neon Postgres project and copy both connection strings:

- `NEON_DATABASE_URL`: pooled connection string for runtime
- `NEON_DIRECT_URL`: direct connection string for Prisma migrations

The Prisma schema uses `DATABASE_URL` for app queries and `DIRECT_URL` for migrations.

### Vercel Projects

Create two Vercel projects from the same GitHub repo:

| Project | Root Directory | Purpose |
| --- | --- | --- |
| `clientpulse-api` | `server` | NestJS API as Vercel Node.js Functions |
| `clientpulse-web` | `client` | Next.js frontend |

Set API project environment variables:

```text
DATABASE_URL=<Neon pooled URL>
DIRECT_URL=<Neon direct URL>
FRONTEND_URLS=https://clientpulse-web.vercel.app,http://localhost:3000
```

Set web project environment variables:

```text
NEXT_PUBLIC_API_URL=https://clientpulse-api.vercel.app
```

Disable Vercel automatic Git deployments if you want GitHub Actions to be the single deployment path.

### GitHub Secrets

Add these repository secrets in GitHub:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_API_PROJECT_ID
VERCEL_WEB_PROJECT_ID
NEON_DATABASE_URL
NEON_DIRECT_URL
```

The deploy workflow:

- Pull requests: runs checks, deploys preview API, then deploys preview web pointed at that preview API.
- Pushes to `main`: runs checks, applies Neon migrations, idempotently seeds demo data, deploys production API, then deploys production web pointed at that API.

Production seeding uses:

```bash
npm run seed:demo --workspace server
```

That command skips seeding when client data already exists, so production demo data is not reset on every deploy.

## Screenshots

Add screenshots after running the seeded app locally:

- Dashboard
- Clients
- Client detail
- Project requests with filters
- Request detail with comments

## Interview Talking Points

- Next.js + TypeScript frontend using App Router conventions
- NestJS modular backend with controllers, services, DTOs, and dependency injection
- RESTful API design with nested resources for clients, projects, requests, and comments
- DTO validation with `class-validator` and a global `ValidationPipe`
- PostgreSQL relational schema with Prisma migrations and indexes
- Seeded local development data for a realistic demo
- Request filtering with `useReducer` and URL-ready query params
- Demo user approach that avoids overbuilt authentication
- Basic logging and auditability through request logs and `AuditEvent`
- GitHub Actions CI split into frontend and backend jobs
- Production-minded tradeoffs: simple auth boundary, no payment, no email, no uploads, no RBAC

## Future Improvements

- Add authenticated users and workspace membership
- Add pagination for large request lists
- Add audit event UI on request detail pages
- Add optimistic updates and toast feedback
- Add e2e coverage for the primary workflow
- Add deployment manifests for a hosted database and API runtime
