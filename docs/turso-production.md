# Turso Production Database

This app uses local SQLite in development and switches to Turso/libSQL in production
when `TURSO_DATABASE_URL` is present.

## 1. Create the Turso database

Install and log in to the Turso CLI:

```bash
brew install tursodatabase/tap/turso
turso auth login
```

Create a production database:

```bash
turso db create dashboard-kanwil-prod
```

Get the database URL and token:

```bash
turso db show dashboard-kanwil-prod --url
turso db tokens create dashboard-kanwil-prod
```

## 2. Configure environment variables

Set these variables in production:

```bash
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
BETTER_AUTH_URL=https://your-production-domain.example
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-production-domain.example
```

For local testing against Turso, place them in `.env.local`.

## 3. Push schema

With the Turso variables available:

```bash
npm run db:push
```

For migration-file workflow:

```bash
npm run db:generate
npm run db:migrate
```

The app also runs an idempotent table check on startup, and the dashboard data is
seeded automatically when the database is empty.

## 4. Open Drizzle Studio

```bash
npm run db:studio
```

When Turso env vars are present, Drizzle Studio connects to the Turso database.
Without them, it connects to `data/dashboard.sqlite`.
