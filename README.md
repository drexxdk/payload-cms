# Payload Blank Template

This template comes configured with the bare minimum to get started on anything you need.

## Quick start

This template can be deployed directly from our Cloud hosting and it will setup MongoDB and cloud S3 object storage for media.

## Getting started (local - Postgres)

The following steps cover everything needed to run this repository locally using the included Postgres Docker compose configuration and the project's seed scripts.

Prerequisites

- Install Docker Desktop: https://www.docker.com/get-started and ensure the service is running.
- Install Node.js (v18 or later recommended). Check with `node -v`.
  Install Yarn (if you don't already have it):

```bash
npm install -g yarn
```

Clone

```bash
git clone https://github.com/drexxdk/payload-cms.git
cd payload-cms
```

Environment

1. Copy the example environment file and open it in VS Code:

```powershell
# PowerShell (Windows)
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Open `.env` in Visual Studio Code to edit values.

2. Edit `.env` and set at minimum:

- `DATABASE_URL` — a Postgres connection string (the docker-compose script below uses the default DB name from `docker-compose.postgres.yml`).
- `PAYLOAD_SECRET` — a random 32+ byte secret. You can generate one quickly:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start Postgres in Docker

This repo includes `docker-compose.postgres.yml` configured for local development.

Use either the provided Yarn script or Docker Compose directly.

```bash
# via yarn script (preferred)
yarn compose:postgres

# or directly
docker-compose -f docker-compose.postgres.yml up -d
```

Verify Postgres is running before proceeding. On Windows, check Docker Desktop or run `docker ps`.

Install dependencies and generate types

```bash
yarn install

# Generate Payload types (run after any collection changes)
yarn generate:types
```

Seed the database

The project includes idempotent seed scripts that create demo projects, users, palettes, products, courses, and also pre-generate demo hero images used by the seeds.

```bash
# Run the global seed (this will pre-generate hero images and create/update demo records)
yarn seed
```

What the seed creates

- Demo project: `RBAC Demo Project`
- Demo group: `RBAC Demo Group`
- Demo course: `RBAC Demo Course`
- Demo users (password: `test`):
  - Super admin: `admin@mail.com` / `test`
  - Viewer: `viewer@mail.com` / `test`
  - Editor: `editor@mail.com` / `test`
  - Manager: `manager@mail.com` / `test`

The seeded users are attached to `RBAC Demo Project` with appropriate roles (viewer, editor, manager). The super-admin user has global `super-admin` privileges.

Run the app locally

```bash
# Start Next.js dev server
yarn dev
```

Open the site:

- Frontend: http://localhost:3000
- Admin: http://localhost:3000/admin

Login with seeded demo accounts above. The admin UI lets you explore collections and the seeded demo data.

Helpful management commands

- Stop Postgres:

```bash
docker-compose -f docker-compose.postgres.yml down
```

- Drop local DB (use with caution):

```bash
# if the repo includes a helper script
yarn db:drop
```

- Re-run the seed after clearing DB:

```bash
yarn seed
```

Build (production)

```bash
yarn build
yarn start
```

Troubleshooting

- If you hit Next.js cache/EPERM issues, try removing the `.next` folder and retrying the build:

```powershell
Remove-Item -LiteralPath .next -Recurse -Force -ErrorAction SilentlyContinue
yarn build
```

- If seeds fail with missing media files, the seed process pre-generates demo hero images in `media/hero-images`. Ensure the process has write permissions to the project directory.

Security notes

- `PAYLOAD_SECRET` should be kept secret in production — do not commit `.env`.
- The seeded accounts are for local/demo use only — change passwords before exposing any instance publicly.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Media

  This is the uploads enabled collection. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).

## RBAC Model

This project uses a two-layer permission model:

- Global roles on `users`
  - `super-admin`: full system access
  - `user`: normal authenticated user
- Project-scoped memberships on `projects`
  - `viewers`: can view that project and child content
  - `editors`: can view and edit that project and child content
  - `managers`: can do everything editors can, plus manage `viewers` and `editors` on that project

Only `super-admin` can:

- create new projects
- delete projects
- manage global user roles
- assign project `managers`

Project `managers` can manage project membership for:

- `viewers`
- `editors`

## Demo Accounts And Seed Data

Run the global seed with:

```bash
yarn seed
```

The seed ensures a demo project and demo memberships exist:

- Project: `RBAC Demo Project`
- Group: `RBAC Demo Group`
- Course: `RBAC Demo Course`

The seed also ensures these users exist:

- Super admin: `admin@mail.com` / `test`
- Viewer: `viewer@mail.com` / `test`
- Editor: `editor@mail.com` / `test`
- Manager: `manager@mail.com` / `test`

Those users are attached to `RBAC Demo Project` as viewer, editor, and manager respectively.

## Developer scripts

This project includes a few npm scripts that help with local development and Payload tooling. Short descriptions and when to run them:

- `devsafe`: like `dev` but removes the Next.js build cache first. Use if you see strange dev-only issues or corrupted caches.
- `generate:importmap`: regenerates the admin `importMap` used by Payload to resolve custom admin component paths. Run this after adding or moving admin components (the import paths declared in `src/*/components`).
- `generate:types`: runs Payload's type generator and writes `payload-types.ts`. Run this after schema/collection changes so TypeScript types stay in sync.
- `payload`: runs the Payload CLI. Useful for commands like `payload login`, `payload export`, or running local migrations if you use Payload's CLI features.

Which ones you need to run:

- For usual development: `yarn install` then `yarn dev` (or `yarn devsafe` if you need a clean start).
- After changing collections/components: run `yarn generate:types` and `yarn generate:importmap`.
- When working with Payload tooling or the local CLI: use `yarn payload` followed by the CLI subcommand.

Quick checklist to get started locally (Postgres setup shown):

1. Copy env: `cp .env.example .env` and update values (set `DATABASE_URL` to a Postgres URL and `PAYLOAD_SECRET`).
2. Start Postgres: `yarn compose:postgres` (this runs `docker-compose -f docker-compose.postgres.yml up -d`).
3. Install deps: `yarn install`.
4. Seed demo data: `yarn seed`.
5. Start dev server: `yarn dev` or `yarn devsafe`.

If anything fails (DB connection, seeds), check `DATABASE_URL` and that Postgres is reachable on the host/port specified.
