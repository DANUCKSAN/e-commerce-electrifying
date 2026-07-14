# PV to EV marketplace

A Next.js App Router storefront for solar, storage, and EV charging products. The homepage is a Server Component that reads the product catalogue from Neon PostgreSQL with Drizzle ORM. A small client-side quote basket demonstrates Zustand without moving database data into global client state.

## Stack

- Next.js 16, React 19, and TypeScript
- ESLint 9 and Tailwind CSS 4
- GSAP and ScrollTrigger for the landing-page motion system
- Better Auth with email/password authentication
- Neon PostgreSQL and the Neon HTTP driver
- Drizzle ORM and Drizzle Kit
- Zustand with a request-scoped vanilla store provider

## Local setup

Use Node.js 20.9 or newer.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Replace `DATABASE_URL` with a Neon connection string and set a random `BETTER_AUTH_SECRET` containing at least 32 characters.

4. Generate and apply the PostgreSQL migration:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. Seed the solar catalogue:

   ```bash
   npm run db:seed
   ```

6. Start the app:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000). Better Auth is mounted at `/api/auth/[...all]` and uses `/api/auth` as its default base path.

When `DATABASE_URL` is missing during local development, the homepage renders the same curated sample records as a labeled preview. As soon as Neon is configured, the page runs the Drizzle query and renders the live `products` rows. Production requires `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` and fails fast if any are missing.

## Database workflow

| Command | Purpose |
| --- | --- |
| `npm run db:generate` | Generate SQL migrations from the Drizzle schemas |
| `npm run db:migrate` | Apply committed migrations to Neon |
| `npm run db:push` | Push schema changes directly during early development |
| `npm run db:seed` | Insert the sample products idempotently by slug |
| `npm run db:studio` | Open Drizzle Studio |

The schema is split between Better Auth's generated tables and the application-owned products table under `src/db/schema`. Generated SQL is committed under `drizzle`.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```
