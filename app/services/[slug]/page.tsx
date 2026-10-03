import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { serviceDetailsOpen, t } from "@/lib/content";
import { servicePage } from "@/lib/services";
import { ServiceDetail } from "@/components/services/Detail";

// A service detail page (D-043). Development only until `serviceDetailsLive` (INVARIANT 32): production 404s it.
async function pageFor(params: PageProps<"/services/[slug]">["params"]) {
  const page = servicePage((await params).slug);
  return page && serviceDetailsOpen() ? page : undefined;
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const page = await pageFor(params);
  if (!page) return {};
  return {
    title: t.serviceDetail.metaTitle.replace("{name}", page.name),
    description: page.text ?? t.servicesPage.metaDescription,
  };
}

export default async function Page({ params }: PageProps<"/services/[slug]">) {
  const page = await pageFor(params);
  if (!page) notFound();
  return <ServiceDetail page={page} />;
}
