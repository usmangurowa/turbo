/**
 * Analyst Agent
 *
 * The Data Scientist - compares time periods and surfaces velocity trends.
 * ONLY does comparisons, NO celebrating, NO advice.
 */
import { generateText, Output } from "ai";
import { z } from "zod";

import type { AnalystMode } from "@turbo/shared";
import { ANALYTICS_EVENTS } from "@turbo/analytics";
import { trackServerEvent } from "@turbo/analytics/server";
import { formatCodingTimeMinutes } from "@turbo/shared";

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
      "Short velocity comparison. 3-8 words. E.g. 'Ahead of yesterday', 'Same pace today'.",
    ),
  subtext: z
    .string()
    .describe(
      "Time comparison with work context. Max 220 characters. Must be a complete sentence.",
    ),
});

const getSystemPrompt = (mode: AnalystMode): string => {
  const comparison =
    mode === "monthly"
      ? "this month vs last month"
      : mode === "weekly"
        ? "this week vs last week"
        : "today vs yesterday";

  return `You are Turbo, narrating the user's velocity story – comparing ${comparison} with context about what they accomplished.

VOICE:
- You are Turbo, talking to the user about their work.
- Do NOT write as the user. Never use "I".
- Avoid "the team", "we", "they", or "he/she".
- Prefer neutral, subject-optional sentences that start with a verb:
  - "Fixed commit listener issues and cleaned up settings sync."
  - "Wrapped up auth flow and some config tweaks."

What works:
- "Productive morning – 2h 30m today vs 1h 45m yesterday, fixing commit listener issues and cleaning up settings sync."
- "Lighter day – 1h today compared to 3h yesterday, mostly debugging the auth flow."
- "Matching pace – About the same as yesterday, wrapped up the session feed work."

What to NEVER do:
- Invent work that isn't in the session list.
- Use generic labels like "Productive day" (say "Productive API work").
- Give advice or be judgmental about the numbers.
- Use marketing-speak like "refined and updated", "improved filters".
- Say "The team…" or "I…" – this is one person, Turbo narrates to them.

RULES:
1. Headline must be specific: "Velocity on Auth" instead of "Good Velocity".
2. Subtext must be a COMPLETE sentence under 220 characters.
3. Subtext should start with a verb phrase, subject optional:
   - "Fixed commit listener and cleaned up settings sync."

Narrate the comparison as a short story using the session titles.`;
};

/**
 * Format sessions into a readable list for the AI prompt
 */
const formatSessionsForPrompt = (sessions: SessionContext[]): string => {
  if (sessions.length === 0) {
    return "No sessions yet today.";
  }

  return sessions
    .slice(0, 3) // Analyst only needs recent sessions for context
    .map((s) => {
      const title = s.title ?? `${s.actionTag ?? "coding"} session`;
      return `- "${title}" (${s.project ?? "unknown"})`;
    })
    .join("\n");
};

export const generateAnalystMessage = async (
  ctx: PersonalityContext,
  mode: AnalystMode,
  dataProvider?: CoachDataProvider,
): Promise<PersonalityResult> => {
  const todayFormatted = formatCodingTimeMinutes(ctx.todayMinutes);
  const yesterdayFormatted = formatCodingTimeMinutes(ctx.yesterdayMinutes);
  const sessionsText = formatSessionsForPrompt(ctx.sessions);

  const prompt = `
Time comparison:
- Today: ${todayFormatted}
- Yesterday: ${yesterdayFormatted}

Recent sessions (${ctx.sessions.length}):
${sessionsText}

Compare today vs yesterday with context from the sessions.`.trim();

  const tools = dataProvider ? createCoachTools(dataProvider) : undefined;

  try {
    const result = await generateText({
      model: coachModel,
      system: getSystemPrompt(mode),
      prompt,
      output: Output.object({ schema }),
      tools,
    });

    trackServerEvent({
      distinctId: "system",
      event: ANALYTICS_EVENTS.AI_MODEL_SUCCESS,
      properties: { model: "groq-llama", type: "coach_analyst", mode },
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
        type: "coach_analyst",
        error: errorMessage.slice(0, 200),
      },
    });

    // Fallback with session context if available
    const firstSession = ctx.sessions[0];
    if (firstSession?.title) {
      return {
        headline: `Velocity: ${todayFormatted}`,
        subtext: `Today vs ${yesterdayFormatted} yesterday. Working on "${firstSession.title}".`,
      };
    }

    return {
      headline: `Velocity: ${todayFormatted}`,
      subtext: `Today vs ${yesterdayFormatted} yesterday.`,
    };
  }
};
