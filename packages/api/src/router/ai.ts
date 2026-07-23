import type { ModelMessage } from "ai";
import { zValidator } from "@hono/zod-validator";
import { streamText } from "ai";
import { Hono } from "hono";
import { z } from "zod";

import { getDefaultModel } from "@turbo/ai/client";

import type { AppContext } from "../context";
import { authMiddleware } from "../middleware/auth";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(50),
});

const SYSTEM_PROMPT =
  "You are the workspace assistant for a full-stack Turborepo template. Answer questions about the workspace concisely and helpfully.";

const app = new Hono<AppContext>()
  /**
   * POST /ai/chat - Stream an assistant reply for a conversation
   *
   * Requires auth so the endpoint is abuse-safe by default. When no AI
   * provider key is configured (the zero-env template), returns 503 with
   * a hint instead of crashing, so the UI can render a setup empty state.
   *
   * Streams plain text via toTextStreamResponse(); the web client reads
   * the body with a ReadableStream reader. Future streaming endpoints
   * should copy this 503-fallback + raw-Response pattern.
   */
  .post(
    "/chat",
    authMiddleware,
    zValidator("json", chatSchema),
    (c): Response => {
      const model = getDefaultModel();
      if (!model) {
        return c.json(
          {
            error: "No AI provider configured",
            hint: "Set GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY",
          },
          503,
        );
      }

      const { messages } = c.req.valid("json");
      const modelMessages: ModelMessage[] = messages.map((message) =>
        message.role === "user"
          ? { role: "user", content: message.content }
          : { role: "assistant", content: message.content },
      );

      const result = streamText({
        model,
        system: SYSTEM_PROMPT,
        messages: modelMessages,
      });

      return result.toTextStreamResponse();
    },
  );

export default app;
