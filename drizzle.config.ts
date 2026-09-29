import { defineConfig } from "drizzle-kit";

// Migrations are generated, reviewed, then applied (D-002, INVARIANT 14): `npx drizzle-kit generate` writes SQL to
// drizzle/; dev applies it on first use (server/db/client.ts); other environments run `npx drizzle-kit migrate` with
// their DATABASE_URL. `push` is denied by settings and bash-guards.
export default defineConfig({
  dialect: "postgresql",
  schema: "./server/db/schema.ts",
  out: "./drizzle",
  ...(process.env.DATABASE_URL ? { dbCredentials: { url: process.env.DATABASE_URL } } : {}),
});
