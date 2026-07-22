import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "@/app/styles.css";

import { Providers } from "@/components/providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "@turbo/ui/components/sonner";
import { ThemeProvider } from "@turbo/ui/components/theme";

const interDisplay = localFont({
  src: [
    {
      path: "../fonts/InterDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/InterDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/InterDisplay-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/InterDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://turbo.app"),
  title: "Turbo - The AI-Native Codebase for Coding Agents",
  description:
    "A full-stack TypeScript monorepo with versioned agent memory, task skills, and generated contracts. Next.js, Expo, Hono, Better Auth, and Drizzle - wired for humans and their coding agents.",
  openGraph: {
    title: "Turbo - The AI-Native Codebase for Coding Agents",
    description:
      "A full-stack TypeScript monorepo with versioned agent memory, task skills, and generated contracts. Next.js, Expo, Hono, Better Auth, and Drizzle - wired for humans and their coding agents.",
    url: "https://turbo.app",
    siteName: "Turbo",
  },
  twitter: {
    card: "summary_large_image",
    site: "@turbo",
    creator: "@turbo",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
    { media: "(prefers-color-scheme: dark)", color: "#161616" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interDisplay.className} ${interDisplay.variable} antialiased`}
      >
        <ThemeProvider>
          <NuqsAdapter>
            <Providers>
              {children}
              <SpeedInsights />
              <Analytics />
            </Providers>
          </NuqsAdapter>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
