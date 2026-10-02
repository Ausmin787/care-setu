import Link from "next/link";
import { notFound } from "next/navigation";
import { t } from "@/lib/content";

// Placeholder for pages built later in Stage 4 (ROADMAP order). Says so plainly; offers nothing fake.
// A production build answers 404 instead, so no visitor lands on an unbuilt page (INVARIANT 18).
export function Stub({ title }: { title: string }) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <section className="wrap" style={{ paddingBlock: "88px", minHeight: "50svh" }}>
      <h1 className="t-head" style={{ margin: 0 }}>
        {title}
      </h1>
      <p style={{ margin: "16px 0 24px", color: "var(--c-muted)" }}>{t.stub.text}</p>
      <Link href="/">{t.stub.back}</Link>
    </section>
  );
}
