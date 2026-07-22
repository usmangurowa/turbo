import type { IconSvgElement } from "@hugeicons/react";
import Link from "next/link";
import { LandingNav } from "@/components/landing/landing-nav";
import { TurboLogo } from "@/components/turbo-logo";
import {
  AiBookIcon,
  AiBrain01Icon,
  ArrowRight01Icon,
  DatabaseIcon,
  DocumentValidationIcon,
  FlashIcon,
  Layers01Icon,
  LockIcon,
  PaintBoardIcon,
  Robot01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@turbo/ui/components/badge";
import { Button } from "@turbo/ui/components/button";
import { Icon } from "@turbo/ui/components/icon";
import { NumberTicker } from "@turbo/ui/components/number-ticker";

interface Feature {
  title: string;
  description: string;
  icon: IconSvgElement;
}

const agentFeatures: Feature[] = [
  {
    title: "Versioned agent memory",
    description:
      "Architecture, conventions, and decisions live in .ai/ — context every agent reads before touching code, updated in the same PR that changes a pattern.",
    icon: AiBrain01Icon,
  },
  {
    title: "Skills, not vibes",
    description:
      "80+ step-by-step playbooks, from create-component to database-change. Agents follow the same procedures your team does.",
    icon: AiBookIcon,
  },
  {
    title: "Contracts, not guesswork",
    description:
      "API routes, DB schema, env, and package exports snapshot into markdown with one command — agents code against reality, not stale docs.",
    icon: DocumentValidationIcon,
  },
  {
    title: "Every agent, one brain",
    description:
      "AGENTS.md, CLAUDE.md, Copilot instructions, and Cursor rules all point at the same shared memory. Switch tools, keep the context.",
    icon: Robot01Icon,
  },
];

const features: Feature[] = [
  {
    title: "Full-stack TypeScript",
    description:
      "End-to-end type safety from your Postgres schema to your React components, with zero codegen steps.",
    icon: Layers01Icon,
  },
  {
    title: "Web + native, one theme",
    description:
      "Next.js and Expo share a single Tailwind theme, so every screen looks the same on every platform.",
    icon: SmartPhone01Icon,
  },
  {
    title: "Auth that just works",
    description:
      "Email OTP, social sign-in, and sessions wired up with Better Auth across web, mobile, and API.",
    icon: LockIcon,
  },
  {
    title: "Instant API",
    description:
      "Hono routers with RPC clients — call your backend like a local function, fully typed.",
    icon: FlashIcon,
  },
  {
    title: "Drizzle + Postgres",
    description:
      "Version-controlled schemas, generated migrations, and a typed query builder out of the box.",
    icon: DatabaseIcon,
  },
  {
    title: "A real design system",
    description:
      "shadcn/ui components themed with your tokens — dark mode, radii, and typography included.",
    icon: PaintBoardIcon,
  },
];

const stats = [
  { value: 80, suffix: "+ skills", caption: "step-by-step agent playbooks" },
  {
    value: 6,
    suffix: " contracts",
    caption: "generated snapshots agents trust",
  },
  { value: 2, suffix: " apps", caption: "web + native from one repo" },
  { value: 1, suffix: " theme", caption: "single source of truth" },
];

export default function HomePage() {
  return (
    <div className="bg-background min-h-svh">
      <LandingNav />

      <main>
        {/* Hero */}
        <section className="container flex flex-col items-center gap-6 py-24 text-center md:py-32">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            <span className="bg-success mr-1.5 inline-block size-1.5 rounded-full" />
            AI-native template — clone, brief your agent, ship
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            An AI-native codebase for serious work with coding agents
          </h1>
          <p className="text-muted-foreground max-w-xl text-base text-balance md:text-lg">
            A full-stack TypeScript monorepo where agents read versioned memory,
            follow task skills, and code against generated contracts. Next.js,
            Expo, auth, database, and theming — already wired.
          </p>
          <div className="flex items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/create-account">
                Get started
                <Icon icon={ArrowRight01Icon} />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">View dashboard</Link>
            </Button>
          </div>
        </section>

        {/* Stat band */}
        <section className="border-y border-dashed">
          <div className="container grid grid-cols-2 gap-px lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.caption}
                className={
                  "flex flex-col gap-1 px-6 py-10 " +
                  (index > 0 ? "border-l border-dashed" : "")
                }
              >
                <span className="text-4xl font-medium tracking-tight md:text-5xl">
                  <NumberTicker value={stat.value} />
                  <span className="text-muted-foreground text-2xl md:text-3xl">
                    {stat.suffix}
                  </span>
                </span>
                <span className="text-muted-foreground text-sm">
                  {stat.caption}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Built for coding agents */}
        <section className="container flex flex-col gap-12 py-24">
          <div className="flex max-w-2xl flex-col gap-3">
            <span className="text-primary text-sm font-medium tracking-wide uppercase">
              AI-native by design
            </span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Onboard your agent like a senior hire
            </h2>
            <p className="text-muted-foreground text-base">
              Versioned context, task playbooks, and generated contracts live in
              the repo — so Claude Code, Copilot, and Cursor stop guessing and
              start shipping.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {agentFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-card flex flex-col gap-4 rounded-2xl border border-dashed p-6"
              >
                <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                  <Icon
                    icon={feature.icon}
                    className="text-primary size-5"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="container flex flex-col gap-12 pb-24">
          <div className="flex max-w-2xl flex-col gap-3">
            <span className="text-primary text-sm font-medium tracking-wide uppercase">
              Everything included
            </span>
            <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Stop wiring, start building
            </h2>
            <p className="text-muted-foreground text-base">
              Every piece of infrastructure a modern product needs, integrated
              and themed — so your first commit is a feature, not config.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card flex flex-col gap-4 rounded-2xl border p-6"
              >
                <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
                  <Icon
                    icon={feature.icon}
                    className="text-foreground size-5"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container pb-24">
          <div className="bg-card flex flex-col items-center gap-6 rounded-3xl border border-dashed px-6 py-16 text-center">
            <h2 className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
              Point your agent at a codebase it can actually navigate
            </h2>
            <p className="text-muted-foreground max-w-md text-base">
              Create an account to explore the full stack — then clone the repo
              and let your coding agent read the memory.
            </p>
            <Button size="lg" asChild>
              <Link href="/create-account">
                Start building
                <Icon icon={ArrowRight01Icon} />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
          <div className="flex items-center gap-2">
            <TurboLogo size="sm" className="text-primary" />
            <span className="text-sm font-medium">Turbo</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Built for humans and their coding agents.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
