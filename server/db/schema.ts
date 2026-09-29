import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { AREAS, PATIENT_LOCATIONS, QUERY_STATUSES } from "../contracts/enums";

// Migration 0001 (D-033): a care query and the consent it was sent with. Personal data lives in `queries` only
// (TRD §5); nothing here is logged. Changes ship as migration files only (D-002, INVARIANT 14).

export const patientLocation = pgEnum("patient_location", PATIENT_LOCATIONS);
export const area = pgEnum("area", AREAS);
export const queryStatus = pgEnum("query_status", QUERY_STATUSES);

const stamp = (name: string) => timestamp(name, { withTimezone: true }).notNull().defaultNow();

export const queries = pgTable("queries", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: varchar("reference", { length: 10 }).notNull().unique(),
  patientLocation: patientLocation("patient_location").notNull(),
  // Null when the family isn't sure which service they need.
  serviceSlug: text("service_slug"),
  area: area("area").notNull(),
  message: varchar("message", { length: 1000 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 13 }).notNull(),
  email: varchar("email", { length: 254 }),
  status: queryStatus("status").notNull().default("new"),
  sourcePage: varchar("source_page", { length: 200 }).notNull(),
  createdAt: stamp("created_at"),
  updatedAt: stamp("updated_at").$onUpdate(() => new Date()),
});

// INVARIANT 12: stored in the same transaction as its query. No IP or user-agent hash (D-033: data minimisation).
export const consents = pgTable("consents", {
  id: uuid("id").primaryKey().defaultRandom(),
  queryId: uuid("query_id")
    .notNull()
    .references(() => queries.id, { onDelete: "cascade" }),
  noticeVersion: varchar("notice_version", { length: 40 }).notNull(),
  purpose: varchar("purpose", { length: 60 }).notNull(),
  grantedAt: stamp("granted_at"),
});
