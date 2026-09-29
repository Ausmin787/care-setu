import { z } from "zod";

// Server configuration from the environment, validated once (ARCHITECTURE §4). Values live only in .env.local or the
// host's secret store (INVARIANT 13). A missing production value fails loudly; nothing defaults an open owner
// question (Q1 database and email provider, Q12 alert recipient).
const Env = z.object({
  NODE_ENV: z.string().optional(),
  // Empty in development = the in-process PGlite database in .pglite/ (D-002).
  DATABASE_URL: z.string().optional().transform((v) => v || undefined),
  // Only the console transport exists until the owners choose an email provider (Q1).
  EMAIL_TRANSPORT: z.enum(["console"]).default("console"),
  EMAIL_TEAM_INBOX: z
    .string()
    .optional()
    .transform((v) => v || undefined),
});

export type Env = z.infer<typeof Env>;

let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;
  const parsed = Env.parse(process.env);
  if (parsed.NODE_ENV === "production") {
    const missing = [
      !parsed.DATABASE_URL && "DATABASE_URL (Q1)",
      parsed.EMAIL_TRANSPORT === "console" && "a real EMAIL_TRANSPORT (Q1)",
      !parsed.EMAIL_TEAM_INBOX && "EMAIL_TEAM_INBOX (Q12)",
    ].filter(Boolean);
    if (missing.length) throw new Error(`Production configuration missing: ${missing.join(", ")}`);
  }
  cached = parsed;
  return parsed;
}
