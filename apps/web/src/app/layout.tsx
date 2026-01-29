import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "@/app/styles.css";

import { Providers } from "@/components/providers";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider } from "@turbo/ui/theme";
import { Toaster } from "@turbo/ui/toast";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://turbo.app"),
  title: "Turbo Template - Build Fast with Auth + DB",
  description:
    "A full-stack starter with Next.js, Expo, Hono, Better Auth, and Drizzle. Replace the UI and ship your product faster.",
  openGraph: {
    title: "Turbo Template - Build Fast with Auth + DB",
    description:
      "A full-stack starter with Next.js, Expo, Hono, Better Auth, and Drizzle. Replace the UI and ship your product faster.",
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
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
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
        className={`${jakartaSans.className} ${jakartaSans.variable} antialiased`}
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
