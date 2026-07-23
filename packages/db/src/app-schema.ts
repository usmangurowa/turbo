import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth-schema";

export const TASK_STATUSES = [
  "pending",
  "in-progress",
  "completed",
  "escalated",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const task = pgTable(
  "task",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    status: text("status", { enum: TASK_STATUSES })
      .default("pending")
      .notNull(),
    priority: text("priority", { enum: TASK_PRIORITIES })
      .default("medium")
      .notNull(),
    dueDate: timestamp("due_date"),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("task_userId_idx").on(table.userId)],
);
