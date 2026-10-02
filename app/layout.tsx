import type { Metadata, Viewport } from "next";
import { Anek_Latin, Petrona, Unbounded } from "next/font/google";
import { connection } from "next/server";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { PromoBanner } from "@/components/site/PromoBanner";
import { t } from "@/lib/content";
import "./globals.css";

// Anek Latin, OFL (D-020). Variable weight + width axis; display runs at width 75.
const anek = Anek_Latin({
  variable: "--font-anek",
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
});

// Display serif, OFL (D-027): variable weight, roman + italic (the one italic phrase per page).
const petrona = Petrona({
  variable: "--font-petrona",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
});

// Web wordmark only (nav + footer): Unbounded 800, OFL (D-023). Provisional until the owners confirm (Q4).
const wordmark = Unbounded({
  variable: "--font-wordmark",
  subsets: ["latin"],
  weight: "800",
});

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
};

export const viewport: Viewport = {
  themeColor: "#fbf6ee",
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Every page renders per request so the CSP nonce reaches Next's inline scripts (D-022).
  await connection();
  return (
    <html lang="en" className={`${anek.variable} ${petrona.variable} ${wordmark.variable}`}>
      <body>
        <a className="skip" href="#main">
          {t.nav.skip}
        </a>
        <PromoBanner />
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
