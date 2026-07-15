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

The schema is split into one module per Better Auth model plus an
application-owned guest-session table under `src/db/schema`. Generated SQL is
committed under `drizzle`.

## Authentication architecture

- Better Auth owns the `user`, `session`, `account`, and `verification` tables.
  IDs and foreign keys use PostgreSQL UUIDs, and Better Auth is configured with
  `advanced.database.generateId: "uuid"` to match.
- `auth_session` is the authenticated session cookie and `guest_session` is the
  guest UUID cookie. Both are HTTP-only, `SameSite=Strict`, scoped to `/`, and
  expire after seven days. `Secure` is mandatory in production and when the
  development `BETTER_AUTH_URL` uses HTTPS; plain HTTP localhost remains usable.
- `src/lib/auth/actions.ts` contains the validated `signUp`, `signIn`,
  `signOut`, `guestSession`, `createGuestSession`, and
  `mergeGuestCartWithUserCart` Server Actions. The `beginCheckout` action is
  ready to attach to the future cart's checkout form. Guest tokens never cross
  the Server Action boundary because only public guest metadata is returned.
- `src/lib/auth/guards.ts` is the server-only authorization boundary. The
  data-free `/checkout` shell calls it at the page boundary; future checkout
  data functions should call it again close to protected data:

  ```tsx
  import { requireAuthenticatedUser } from "@/lib/auth/guards";

  export default async function CheckoutPage() {
    const { user } = await requireAuthenticatedUser("/checkout");
    // Fetch and render this user's checkout data.
  }
  ```

  Unauthenticated visitors are redirected to
  `/sign-in?callbackURL=%2Fcheckout`. Sign-in and sign-up validate that callback
  as an internal path, merge the guest ownership boundary, delete the guest
  cookie/record, and return the user to checkout.

The `/checkout` shell intentionally contains no cart or order implementation.
The repository has no persisted cart schema yet. The centralized
guest ownership section in `mergeGuestOwnership` is where idempotent cart and
wishlist ownership updates should be added when those tables are introduced;
the guest record is deleted only after that section succeeds.

Migration `0001_strange_kang.sql` also converts any existing Better Auth text
IDs to deterministic UUIDs while preserving account/session user references.
Back up a populated database before applying any production migration.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
```
