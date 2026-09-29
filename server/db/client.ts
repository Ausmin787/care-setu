import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { env } from "../config/env";
import * as schema from "./schema";

// One database handle per server process (D-002): any Postgres through DATABASE_URL, or PGlite in development.
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

const MIGRATIONS = path.join(process.cwd(), "drizzle");

// PGlite with the reviewed migrations applied. `dataDir` undefined = in memory (tests).
export async function openPglite(dataDir?: string): Promise<Db> {
  const db = drizzlePglite({ client: new PGlite(dataDir), schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  return db;
}

async function open(): Promise<Db> {
  const { DATABASE_URL } = env();
  // Hosted databases are migrated by `drizzle-kit migrate` at deploy, never at request time.
  if (DATABASE_URL) return drizzleNodePg({ connection: DATABASE_URL, schema });
  return openPglite(path.join(process.cwd(), ".pglite"));
}

// Kept on globalThis so dev hot reloads reuse the open database instead of opening .pglite/ twice.
const holder = globalThis as { careSetuDb?: Promise<Db> };

export function getDb(): Promise<Db> {
  holder.careSetuDb ??= open();
  return holder.careSetuDb;
}
