/**
 * Hype Man Agent
 *
 * The Supportive Peer - celebrates specific accomplishments.
 * Narrates WHAT they shipped, not generic encouragement.
 */
import { generateText, Output } from "ai";
import { z } from "zod";

import { ANALYTICS_EVENTS } from "@turbo/analytics";
import { trackServerEvent } from "@turbo/analytics/server";

import type {
  PersonalityContext,
  PersonalityResult,
  SessionContext,
} from "./types";
import { coachModel } from "../../client";

const schema = z.object({
  headline: z
    .string()
    .describe(
      "Short title of what they shipped. 3-8 words. E.g. 'Bug fixes shipped', 'Auth work done'.",
    ),
  subtext: z
    .string()
    .describe(
      "Celebratory summary of accomplishments based on sessions. Max 220 characters. Must be a complete sentence.",
    ),
});

const SYSTEM_PROMPT = `You are Turbo, summarizing what someone accomplished today in a celebratory but specific way.

VOICE:
- You are Turbo, talking to the user about their work.
- Do NOT write as the user. Never use "I".
- Avoid "the team", "we", "they", or "he/she".
- Prefer neutral, subject-optional sentences that start with a verb:
  - "Fixed commit listener issues and cleaned up settings sync."
  - "Wrapped up auth flow and some config tweaks."

What works:
- "Bug fixes landed – Fixed commit listener issues and cleaned up settings sync."
- "Debugging day – Tracked down problems in the session sync and fixed a flaky test."
- "Feature shipped – Wrapped up the auth flow work and some config tweaks."

What to NEVER do:
- Invent work that isn't in the session list.
- Generic encouragement ("Keep going!", "Nice work!").
- Advice or suggestions.
- Phrases like "were refined and updated", "the team did X".
- Say "The team…" or "I…" – Turbo narrates to the user.

RULES:
1. Headline must be specific: "Auth Flow Shipped" instead of "Shipped".
2. Subtext must be a COMPLETE sentence under 220 characters.
3. Subtext should start with a verb phrase, subject optional:
   - "Cleaned up the filters and updated the report API."

Narrate their wins using the session titles.`;

/**
 * Format sessions into a readable list for the AI prompt
 */
const formatSessionsForPrompt = (sessions: SessionContext[]): string => {
  if (sessions.length === 0) {
    return "No sessions yet today.";
  }

  return sessions
    .map((s) => {
      const tag = s.actionTag ?? "coding";

      if (s.status === "ongoing" || s.status === "synced") {
        const files = s.recentFiles?.slice(0, 3).join(", ") ?? "files";
        return `- [ACTIVE] ${tag} on ${s.project ?? "a project"} (${files})`;
      }

      const title = s.title ?? `${tag} session`;
      return `- "${title}" (${tag}, ${s.project ?? "unknown"})`;
    })
    .join("\n");
};

export const generateHypeMessage = async (
  ctx: PersonalityContext,
): Promise<PersonalityResult> => {
  const sessionsText = formatSessionsForPrompt(ctx.sessions);

  const prompt = `
Sessions today (${ctx.sessions.length}):
${sessionsText}
Status: ${ctx.isCurrentlyActive ? "currently active" : "wrapped up"}

Narrate what they accomplished based on these sessions. Be celebratory but specific.`.trim();

  try {
    const result = await generateText({
      model: coachModel,
      system: SYSTEM_PROMPT,
      prompt,
      output: Output.object({ schema }),
    });

    trackServerEvent({
      distinctId: "system",
      event: ANALYTICS_EVENTS.AI_MODEL_SUCCESS,
      properties: { model: "groq-llama", type: "coach_hype" },
    });

    return {
      headline: result.output.headline.slice(0, 60),
      subtext: result.output.subtext.slice(0, 220),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    trackServerEvent({
      distinctId: "system",
      event: ANALYTICS_EVENTS.AI_MODEL_FAILED,
      properties: {
        model: "groq-llama",
        type: "coach_hype",
        error: errorMessage.slice(0, 200),
      },
    });

    // Fallback - use first session title if available
    const firstSession = ctx.sessions[0];
    const sessionCount = ctx.sessions.length;
    const sessionWord = sessionCount === 1 ? "session" : "sessions";

    if (firstSession?.title) {
      return {
        headline: `${sessionCount} ${sessionWord} shipped`,
        subtext: `You worked on "${firstSession.title}" today.`,
      };
    }

    const project = firstSession?.project ?? "your projects";
    return {
      headline: `${sessionCount} ${sessionWord} shipped`,
      subtext: `You've been ${firstSession?.actionTag ?? "coding"} on ${project} today.`,
    };
  }
};
