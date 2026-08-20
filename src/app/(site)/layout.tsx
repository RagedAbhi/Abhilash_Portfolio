import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { NoiseOverlay } from "@/components/layout/NoiseOverlay";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Nav } from "@/components/layout/Nav";
import { ProgressIndicator } from "@/components/layout/ProgressIndicator";
import { ThemeShift } from "@/components/layout/ThemeShift";
import { getSiteSettings } from "@/lib/keystatic/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: `${site.name} — ${site.role}`,
    description: site.tagline,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const site = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <SmoothScrollProvider>
          <LoadingScreen />
          <NoiseOverlay />
          <CustomCursor />
          <ProgressIndicator />
          <Nav name={site.name} />
          <ThemeShift />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
