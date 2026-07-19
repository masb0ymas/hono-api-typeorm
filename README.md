# Hono API TypeORM

Rest API built with [Hono.js](https://hono.dev) and [TypeORM](https://typeorm.io), using PostgreSQL as the database and JWT for authentication.

## Tech Stack

- **[Hono](https://hono.dev)** – lightweight web framework
- **[TypeORM](https://typeorm.io)** – ORM for PostgreSQL (entities, migrations, subscribers)
- **[Zod](https://zod.dev)** – schema validation & environment variable parsing
- **[@dotenvx/dotenvx](https://dotenvx.com)** – environment variable loading
- **[argon2](https://github.com/ranisalt/node-argon2)** – password hashing
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** – JWT auth
- **[hono-rate-limiter](https://github.com/rhinobase/hono-rate-limiter)** – rate limiting middleware
- **pnpm** – package manager, **TypeScript** – language

## Project Structure

```
.
├── Dockerfile                 # Multi-stage production Docker build (pnpm-based)
├── script/                    # CLI helper scripts (run with `bun`)
│   ├── create-migration.ts    # Scaffold a new TypeORM migration file
│   └── create-subscription.ts # Scaffold a new TypeORM subscriber file
├── public/                    # Static assets served at /static/*
└── src/
    ├── main.ts                 # App entrypoint: init DB, start Hono server
    ├── config/
    │   ├── env.ts               # Zod-validated environment config (env.app/jwt/typeorm)
    │   └── database.ts          # TypeORM DataSource setup & initializeDatabase()
    ├── app/
    │   ├── routers/             # Hono route composition
    │   │   ├── index.ts          # Root app: global middlewares, mounts home/v1, error handler
    │   │   ├── home.ts           # `/` health route
    │   │   └── v1.ts             # `/v1` API routes (auth, users, roles, sessions)
    │   ├── handlers/            # Route handlers (controllers) per resource
    │   │   ├── auth.ts           # Login, register, refresh-token, logout
    │   │   ├── user.ts           # User CRUD
    │   │   ├── role.ts           # Role CRUD
    │   │   └── session.ts        # Session listing/management
    │   ├── repositories/        # Data-access layer wrapping TypeORM repositories
    │   │   ├── base.ts           # Generic base repository (pagination, filtering, sorting)
    │   │   ├── user.ts / role.ts / session.ts
    │   ├── middlewares/         # Hono middlewares
    │   │   ├── authorization.ts  # JWT auth guard
    │   │   ├── error-handler.ts  # Central onError handler
    │   │   ├── rate-limiter.ts   # Rate limiting config
    │   │   └── types.ts
    │   └── dtos/                 # Zod DTOs/schemas for request validation
    │       ├── auth.ts / user.ts / role.ts / paginate.ts / base.ts
    ├── database/
    │   ├── entities/             # TypeORM entities (base, user, role, session, refresh_token)
    │   ├── migrations/           # TypeORM migrations (schema + seed data)
    │   └── subscribers/          # TypeORM entity subscribers
    ├── lib/
    │   ├── http/
    │   │   ├── response.ts        # Standardized success response helpers
    │   │   └── errors/            # Custom HTTP error classes (400/401/403/404/500)
    │   ├── jwt/                   # Sign/verify JWT helpers
    │   ├── query/                 # Pagination, filtering, sorting query builders
    │   ├── constants/             # App-wide constants (cors, error, message, jwt, seed data)
    │   ├── validate.ts / validation.ts  # Shared validation helpers
    │   ├── date.ts / number.ts     # Utility helpers
    └── types/                    # Shared TypeScript types (message, repository, time)
```

## Prerequisites

- Node.js `>= 24.x` (see `.nvmrc`)
- [pnpm](https://pnpm.io) `11.10.0` (declared in `packageManager`)
- PostgreSQL database
- [Bun](https://bun.sh) (only needed for `db:migrate:create` / `db:subscribe:create` scripts)

## Getting Started

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your database credentials, JWT secret, and app settings. See [Environment Variables](#environment-variables) below.

3. **Run in development mode**

   ```bash
   pnpm dev
   ```

   This builds the TypeScript sources in watch mode and restarts the server on changes (via `nodemon`). The API will be available at `http://localhost:8080` (or the `PORT` you configured).

4. **Build & run for production**

   ```bash
   pnpm build
   pnpm start
   ```

## Environment Variables

Defined and validated in `src/config/env.ts` (via Zod). See `.env.example` for the full list:

| Variable                                                                                   | Description                                          |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| `NODE_ENV`                                                                                 | `development` \| `production` \| `test` \| `staging` |
| `MACHINE_ID`                                                                               | Unique machine/instance identifier                   |
| `DEBUG`                                                                                    | Enable debug logging                                 |
| `PORT`                                                                                     | HTTP server port                                     |
| `APP_NAME`, `APP_URL`                                                                      | App metadata                                         |
| `APP_DEFAULT_PASS`                                                                         | Default password used for seeded users               |
| `JWT_SECRET`, `JWT_EXPIRES`                                                                | JWT signing secret & expiry                          |
| `TYPEORM_CONNECTION`                                                                       | `mysql` \| `postgres` \| `sqlite`                    |
| `TYPEORM_HOST`, `TYPEORM_PORT`, `TYPEORM_USERNAME`, `TYPEORM_PASSWORD`, `TYPEORM_DATABASE` | Database connection                                  |
| `TYPEORM_SYNCHRONIZE`, `TYPEORM_LOGGING`, `TYPEORM_MIGRATIONS_RUN`                         | TypeORM behavior flags                               |
| `TYPEORM_TIMEZONE`                                                                         | Database timezone                                    |

## Database & Migrations

Migration/subscriber scripts operate on the **built** output in `dist/`, so run `pnpm build` (or have `dev` running) before executing them.

```bash
# Create a new migration file (scaffolded under src/database/migrations)
pnpm db:migrate:create

# Run pending migrations
pnpm db:migrate:run

# Create a new subscriber file (scaffolded under src/database/subscribers)
pnpm db:subscribe:create

# Sync schema directly (drops + re-syncs, dev only)
pnpm db:reset
pnpm db:sync
```

## API Overview

All versioned routes are mounted under `/v1` (see `src/app/routers/v1.ts`):

| Method(s) | Path             | Description                            |
| --------- | ---------------- | -------------------------------------- |
| `*`       | `/`              | Health check (`home` router)           |
| `*`       | `/v1/auth/*`     | Login, register, refresh token, logout |
| `*`       | `/v1/users/*`    | User management                        |
| `*`       | `/v1/roles/*`    | Role management                        |
| `*`       | `/v1/sessions/*` | Session listing/management             |
| `*`       | `/static/*`      | Static files served from `public/`     |

Global middlewares applied in `src/app/routers/index.ts`: request logging, gzip compression, request ID, 1MB body limit, CORS, rate limiting, and centralized error handling (`src/app/middlewares/error-handler.ts`, `src/lib/http/errors`).

## Other Scripts

| Script                                                               | Description                                            |
| -------------------------------------------------------------------- | ------------------------------------------------------ |
| `pnpm format`                                                        | Lint (ESLint --fix) and format (Prettier) the codebase |
| `pnpm check`                                                         | Type-check without emitting output                     |
| `pnpm clean`                                                         | Remove the `dist/` folder                              |
| `pnpm release` / `release:patch` / `release:minor` / `release:major` | Cut a new release via `release-it`                     |

## Docker

Build and run the production image:

```bash
docker build -t hono-api-typeorm .
docker run -p 8080:8080 hono-api-typeorm
```

The `Dockerfile` uses a multi-stage `pnpm` build and expects a `.env.production` file to be present at build time.

## License

MIT
