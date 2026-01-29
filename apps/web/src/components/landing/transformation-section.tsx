"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@turbo/ui";

export const TransformationSection = () => {
  const [activeTab, setActiveTab] = useState<"surveillance" | "support">(
    "support",
  );

  return (
    <section className="py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            The Shift
          </h2>

          <div className="border-border bg-card/50 relative flex items-center gap-2 rounded-full border p-1 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("surveillance")}
              className={cn(
                "relative rounded-full px-6 py-2 text-sm font-medium transition-colors md:text-base",
                activeTab === "surveillance"
                  ? "text-red-500"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Fragmented Setup
              {activeTab === "surveillance" && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 -z-10 rounded-full bg-red-500/10"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("support")}
              className={cn(
                "relative rounded-full px-6 py-2 text-sm font-medium transition-colors md:text-base",
                activeTab === "support"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Solid Foundation
              {activeTab === "support" && (
                <motion.div
                  layoutId="active-tab"
                  className="bg-primary/10 absolute inset-0 -z-10 rounded-full"
                />
              )}
            </button>
          </div>

          <div className="relative min-h-[200px] w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {activeTab === "surveillance" ? (
                <motion.div
                  key="surveillance"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <p className="text-muted-foreground text-2xl font-medium md:text-3xl">
                    "Auth, DB, API, and UI all live in separate repos."
                  </p>
                  <p className="mt-4 text-sm tracking-widest text-red-500/70 uppercase">
                    The Old Way
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="support"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 flex flex-col items-center justify-center"
                >
                  <p className="text-foreground text-2xl font-medium md:text-3xl">
                    "Everything is wired. I can ship features today."
                  </p>
                  <p className="text-primary mt-4 text-sm tracking-widest uppercase">
                    The Turbo Way
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
