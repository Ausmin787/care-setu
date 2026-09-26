import Link from "next/link";
import { t } from "@/lib/content";

// Placeholder for pages built later in Stage 4 (ROADMAP order). Says so plainly; offers nothing fake.
export function Stub({ title }: { title: string }) {
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
