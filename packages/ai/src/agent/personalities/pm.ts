/**
 * Project Manager Agent
 *
 * The Agile Coach - translates activity into product progress.
 * Focuses on WHAT was built, not time spent.
 */
import { generateText, Output } from "ai";
import { z } from "zod";

import { ANALYTICS_EVENTS } from "@turbo/analytics";
import { trackServerEvent } from "@turbo/analytics/server";

import type { CoachDataProvider } from "../tools";
import type {
  PersonalityContext,
  PersonalityResult,
  SessionContext,
} from "./types";
import { coachModel } from "../../client";
import { createCoachTools } from "../tools";

const schema = z.object({
  headline: z
    .string()
    .describe(
      "Short product accomplishment. 3-8 words. E.g. 'Auth flow shipped', 'Dashboard improved'.",
    ),
  subtext: z
    .string()
    .describe(
      "Product progress summary from sessions. Max 220 characters. Must be a complete sentence.",
    ),
});

const SYSTEM_PROMPT = `You are Turbo, narrating someone's product progress today – what features got attention and what moved forward.

VOICE:
- You are Turbo, talking to the user about their work.
- Do NOT write as the user. Never use "I".
- Avoid "the team", "we", "they", or "he/she".
- Prefer neutral, subject-optional sentences that start with a verb:
  - "Fixed the commit listener and cleaned up settings sync."
  - "Polished the metrics widget and activity view."

What works:
- "Auth flow shipped – Fixed the commit listener and cleaned up settings sync."
- "Session tracking tighter – Wrapped up the analytics integration."
- "Dashboard polished – Gave the metrics widget and activity view some love."

Abstraction examples (translate technical to product):
- "Fix commit listener bug" → "Fixed version control tracking"
- "Refactor settings sync" → "Made settings changes more reliable"
- "Debug session feed" → "Polished the activity view"

What to NEVER do:
- Invent features that aren't in the session list.
- Say "The team…", "I…", or "we" – Turbo narrates to the user.
- Use stiff phrases like "were refined and updated" or "filters were improved".

RULES:
1. Headline must be specific: "Login Flow Shipped" instead of "Auth Shipped".
2. Subtext must be a COMPLETE sentence under 220 characters.
3. Subtext should start with a verb phrase, subject optional:
   - "Fixed the commit listener and cleaned up settings sync."
4. Use past tense only.

Narrate their product accomplishments using the session titles.`;

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

export const generatePMMessage = async (
  ctx: PersonalityContext,
  dataProvider?: CoachDataProvider,
): Promise<PersonalityResult> => {
  const sessionsText = formatSessionsForPrompt(ctx.sessions);

  const prompt = `
Sessions today (${ctx.sessions.length}):
${sessionsText}

Describe the product progress based on these sessions. No time mentions.`.trim();

  const tools = dataProvider ? createCoachTools(dataProvider) : undefined;

  try {
    const result = await generateText({
      model: coachModel,
      system: SYSTEM_PROMPT,
      prompt,
      output: Output.object({ schema }),
      tools,
    });

    trackServerEvent({
      distinctId: "system",
      event: ANALYTICS_EVENTS.AI_MODEL_SUCCESS,
      properties: { model: "groq-llama", type: "coach_pm" },
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
        type: "coach_pm",
        error: errorMessage.slice(0, 200),
      },
    });

    // Fallback - use first session title if available
    const firstSession = ctx.sessions[0];

    if (firstSession?.title) {
      return {
        headline: `Working on ${firstSession.project ?? "your project"}`,
        subtext: `Progress on "${firstSession.title}" today.`,
      };
    }

    const project = firstSession?.project ?? "your project";
    return {
      headline: `Working on ${project}`,
      subtext: `${firstSession?.actionTag ?? "Coding"} in progress.`,
    };
  }
};
