import { randomInt } from "node:crypto";
import { CONSENT_PURPOSE } from "@/lib/privacy";
import type { EmailTransport } from "../adapters/email";
import { ALPHABET } from "../contracts/enums";
import type { QueryInput } from "../contracts/queries";
import type { Db } from "../db/client";
import { consents, queries } from "../db/schema";

export function newReference(): string {
  let reference = "";
  for (let i = 0; i < 10; i++) reference += ALPHABET[randomInt(ALPHABET.length)];
  return reference;
}

// A care query and its consent are stored together or not at all (INVARIANT 12). The team alert goes out after the
// commit; if it fails the query is still safe in the database, and only its internal id is logged (INVARIANT 11).
export async function createQuery(
  db: Db,
  input: QueryInput,
  email: EmailTransport
): Promise<{ id: string; reference: string }> {
  const created = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(queries)
      .values({
        reference: newReference(),
        patientLocation: input.patientLocation,
        serviceSlug: input.service,
        area: input.area,
        message: input.message,
        name: input.name,
        phone: input.phone,
        email: input.email,
        sourcePage: input.sourcePage,
      })
      .returning({ id: queries.id, reference: queries.reference });
    await tx
      .insert(consents)
      .values({ queryId: row.id, noticeVersion: input.noticeVersion, purpose: CONSENT_PURPOSE });
    return row;
  });

  try {
    await email.queryAlert(created);
  } catch {
    console.error(`[queries] team alert failed for query ${created.id}`);
  }
  return created;
}
