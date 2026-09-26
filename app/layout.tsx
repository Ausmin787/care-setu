import type { Metadata, Viewport } from "next";
import { Anek_Latin } from "next/font/google";
import localFont from "next/font/local";
import { connection } from "next/server";
import { Footer } from "@/components/site/Footer";
import { Nav } from "@/components/site/Nav";
import { t } from "@/lib/content";
import "./globals.css";

// Anek Latin, OFL (D-020). Variable weight + width axis; display runs at width 75.
const anek = Anek_Latin({
  variable: "--font-anek",
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
});

// Wordmark only: the logo's Open Sans 700 (brand/fonts, OFL).
const wordmark = localFont({
  variable: "--font-wordmark",
  src: "../brand/fonts/OpenSans-VF.ttf",
  weight: "700",
});

export const metadata: Metadata = {
  title: t.meta.title,
  description: t.meta.description,
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Every page renders per request so the CSP nonce reaches Next's inline scripts (D-022).
  await connection();
  return (
    <html lang="en" className={`${anek.variable} ${wordmark.variable}`}>
      <body>
        <a className="skip" href="#main">
          {t.nav.skip}
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
