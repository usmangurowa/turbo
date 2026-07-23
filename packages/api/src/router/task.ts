import { zValidator } from "@hono/zod-validator";
import { desc } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { task, TASK_PRIORITIES, TASK_STATUSES } from "@turbo/db/schema";

import type { AppContext } from "../context";
import { authMiddleware } from "../middleware/auth";

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: z.coerce.date().optional(),
});

const app = new Hono<AppContext>()
  /**
   * GET /tasks - List the 50 most recent tasks
   *
   * Public by design: the zero-env template must browse without auth.
   * When the database is unavailable (no POSTGRES_URL), returns an
   * empty list so the UI falls back to sample data.
   */
  .get("/", async (c) => {
    const db = c.get("db");
    try {
      const tasks = await db
        .select()
        .from(task)
        .orderBy(desc(task.createdAt))
        .limit(50);
      return c.json({ tasks });
    } catch {
      return c.json({ tasks: [] });
    }
  })
  /**
   * POST /tasks - Create a task for the authenticated user
   */
  .post(
    "/",
    authMiddleware,
    zValidator("json", createTaskSchema),
    async (c) => {
      const session = c.get("session");
      const body = c.req.valid("json");

      if (!session?.user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const db = c.get("db");
      const [created] = await db
        .insert(task)
        .values({
          title: body.title,
          status: body.status,
          priority: body.priority,
          dueDate: body.dueDate,
          userId: session.user.id,
        })
        .returning();

      return c.json({ task: created }, 201);
    },
  );

export default app;
