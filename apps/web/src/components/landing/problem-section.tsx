"use client";

import { motion } from "motion/react";

export const ProblemSection = () => {
  return (
    <section className="py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-12 text-center md:gap-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl leading-[1.1] font-bold tracking-tight md:text-6xl lg:text-7xl"
          >
            <span className="text-muted-foreground block">
              You have an idea.
            </span>
            <span className="text-muted-foreground block">
              Boilerplate slows you down.
            </span>
            <span className="text-foreground block">
              Turbo removes the friction.
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col items-center gap-8"
          >
            <p className="text-muted-foreground max-w-xl text-lg md:text-xl">
              Auth, database, and API wiring shouldn&apos;t be a multi-week
              distraction. Start from a production-ready baseline and build what
              matters.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
