"use client";

import { useState } from "react";
import {
  ContextVisual,
  SquadVisual,
  WellnessVisual,
} from "@/components/landing/visuals";
import {
  Activity02Icon,
  Message01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@turbo/ui";
import { Icon } from "@turbo/ui/icon";

const PILLARS = [
  {
    id: "auth",
    title: "Auth Ready",
    subtitle: "SECURE",
    description: "Better Auth is wired for web and API out of the box.",
    icon: Message01Icon,
    visual: ContextVisual,
  },
  {
    id: "database",
    title: "Database Ready",
    subtitle: "TYPE-SAFE",
    description: "Drizzle + Postgres with shared schemas and validators.",
    icon: Activity02Icon,
    visual: WellnessVisual,
  },
  {
    id: "experience",
    title: "Full-Stack Parity",
    subtitle: "CONSISTENT",
    description: "Web, mobile, and API share types, UI, and tooling.",
    icon: UserGroupIcon,
    visual: SquadVisual,
  },
];

export const FeaturesSection = () => {
  const [activeId, setActiveId] = useState<string | null>("database");

  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-4 lg:h-[500px] lg:flex-row">
          {PILLARS.map((pillar) => {
            const isActive = activeId === pillar.id;

            return (
              <motion.div
                key={pillar.id}
                onHoverStart={() => setActiveId(pillar.id)}
                onClick={() => setActiveId(pillar.id)}
                className={cn(
                  "relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border transition-colors",
                  isActive
                    ? "border-primary/20 bg-primary/5 grow-2"
                    : "border-border/50 bg-card/30 hover:bg-card/50 grow",
                )}
                layout
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                {/* Visual Background - hidden on mobile */}
                <div
                  className={cn(
                    "absolute inset-x-0 top-0 hidden h-[60%] transition-opacity duration-500 lg:block",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                >
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full w-full"
                    >
                      <pillar.visual />
                    </motion.div>
                  )}
                </div>

                <div className="relative z-10 flex h-full flex-col p-8">
                  {/* Header Area */}
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon icon={pillar.icon} size={24} />
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium tracking-widest uppercase transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {pillar.subtitle}
                    </span>
                  </div>

                  {/* Content Area */}
                  <div className="mt-auto flex flex-col gap-4">
                    <motion.h3
                      layout="position"
                      className={cn(
                        "font-bold tracking-tight transition-all duration-300",
                        isActive ? "text-3xl md:text-4xl" : "text-xl",
                      )}
                    >
                      {pillar.title}
                    </motion.h3>

                    <AnimatePresence mode="popLayout">
                      {isActive && (
                        <motion.p
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ delay: 0.1 }}
                          className="text-muted-foreground text-lg leading-relaxed dark:text-gray-300"
                        >
                          {pillar.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Decorative Gradient for Active State */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="to-primary/5 absolute inset-0 -z-10 bg-linear-to-b from-transparent via-transparent"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
