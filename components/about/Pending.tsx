import { t } from "@/lib/content";

// D-029: the "awaiting owner" tag. Pending blocks only render in development, so this never reaches production.
export function Pending({ on }: { on: boolean }) {
  return on ? (
    <span className="pending" title={t.pending.title}>
      {t.pending.tag}
    </span>
  ) : null;
}
