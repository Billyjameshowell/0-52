# Oneper — Deployment notes (V1)

This repo currently runs in **dev-local mode** for data (localStorage) and **dev auth** (cookie set by `DEV_LOGIN` or `/login`).

## Environment variables

### Required for production DB (Fly Postgres)

- `DATABASE_URL` — Postgres connection string.
  - Fly typically sets this via secrets or from `fly pg attach`.

### Dev auth

- `DEV_LOGIN` — enables dev-mode auto-login when set.
  - `DEV_LOGIN=1` → logs in as `dev`
  - `DEV_LOGIN=alice` or `DEV_LOGIN=alice@example.com` → logs in as `alice`
  - unset/falsey → no auto-login (use `/login`)

### Planned (not required yet): Tigris / S3-compatible object storage

- `S3_ENDPOINT` (ex: `https://fly.storage.tigris.dev`)
- `S3_REGION` (ex: `auto`)
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- (optional) `S3_PUBLIC_BASE_URL`

## Prisma / Postgres

Prisma schema is stubbed at `prisma/schema.prisma`.

Commands:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Fly Postgres quick start (example):

```bash
# create Postgres
fly postgres create
# attach to app and set DATABASE_URL
fly postgres attach --app <app> <pg-name>
```

> Once DB-backed flows land, remember to run migrations on deploy.
