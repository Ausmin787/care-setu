// Answer values shared by the enquiry contract, the database enums and the form (D-033). No imports, so drizzle-kit
// can load the schema that uses them.
export const PATIENT_LOCATIONS = ["hospital", "home", "not_sure"] as const;
export const AREAS = ["noida", "delhi", "other"] as const;
export const QUERY_STATUSES = ["new", "contacted", "quoted", "closed", "spam"] as const;
// 31 characters without 0/O or 1/I/L, so a reference survives being read out on the phone (enquiries and quotes).
export const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
