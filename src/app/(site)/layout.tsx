import type { Metadata } from "next";
import Script from "next/script";
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          // Runs before hydration so a returning visitor's saved light-mode
          // preference applies immediately, instead of flashing dark (the
          // default/SSR render) first. Paired with suppressHydrationWarning on
          // <html> above, since this attribute is applied outside React's own
          // render output and would otherwise be flagged as a mismatch.
        >
          {"try{if(localStorage.getItem('theme')==='light'){document.documentElement.setAttribute('data-theme','light');}}catch(e){}"}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <SmoothScrollProvider>
          <LoadingScreen />
          <NoiseOverlay />
          <CustomCursor />
          <ProgressIndicator />
          <Nav name={site.name} resumeUrl={site.resumeUrl} />
          <ThemeShift />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
