# Payload Blank Template

This template comes configured with the bare minimum to get started on anything you need.

## Quick start

This template can be deployed directly from our Cloud hosting and it will setup MongoDB and cloud S3 object storage for media.

## Quick Start - local setup

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

### Development

1. First [clone the repo](#clone) if you have not done so already
2. `cd my-project && cp .env.example .env` to copy the example environment variables. You'll need to add the `MONGODB_URL` from your Cloud project to your `.env` if you want to use S3 storage and the MongoDB database that was created for you.

3. `pnpm install && pnpm dev` to install dependencies and start the dev server
4. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

#### Docker (Optional)

If you prefer to use Docker for local development instead of a local MongoDB instance, the provided docker-compose.yml file can be used.

To do so, follow these steps:

- Modify the `MONGODB_URL` in your `.env` file to `mongodb://127.0.0.1/<dbname>`
- Modify the `docker-compose.yml` file's `MONGODB_URL` to match the above `<dbname>`
- Run `docker-compose up` to start the database, optionally pass `-d` to run in the background.

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
