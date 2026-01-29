/**
 * Wellness Guard Agent
 *
 * Acknowledges deep focus accomplishments.
 * Narrates what they achieved during extended sessions, NOT break suggestions.
 */
import { generateText, Output } from "ai";
import { z } from "zod";

import { ANALYTICS_EVENTS } from "@turbo/analytics";
import { trackServerEvent } from "@turbo/analytics/server";
import { formatCodingTimeMinutes } from "@turbo/shared";

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
      "Short title of deep work accomplished. 3-8 words. E.g. 'Focused debugging', 'Deep work session'.",
    ),
  subtext: z
    .string()
    .describe(
      "Summary of what they accomplished during focus. Max 220 characters. Must be a complete sentence.",
    ),
});

const SYSTEM_PROMPT = `You are Turbo, acknowledging someone's deep focus session – telling them what they accomplished during this stretch.

VOICE:
- You are Turbo, talking to the user about their work.
- Do NOT write as the user. Never use "I".
- Avoid "the team", "we", "they", or "he/she".
- Prefer neutral, subject-optional sentences that start with a verb:
  - "Spent this block fixing commit listener issues and refactoring settings."
  - "Solid stretch tackling the auth flow bug and cleaning up tests."

Tone: calm, matter-of-fact.

What works:
- "Deep focus on listeners – Spent this block fixing commit listener issues and refactoring settings."
- "Extended auth session – Solid stretch tackling the auth flow bug and cleaning up tests."
- "Long push on sync – Pushed through debugging on the session sync."

What to NEVER do:
- Invent work that isn't in the session list.
- Suggest breaks ("Maybe stretch?", "Time for coffee?").
- Give health advice ("Don't forget to hydrate").
- Say "The team…", "I…", or "we" – Turbo narrates to the user.
- Use stiff phrases like "were refined and updated".

RULES:
1. Headline must be specific: "Focus on API" instead of "Focus Time".
2. Subtext must be a COMPLETE sentence under 220 characters.
3. Subtext should start with a verb phrase, subject optional:
   - "Spent this block fixing commit listener issues."

Just acknowledge what they accomplished using the session titles.`;

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

export const generateWellnessMessage = async (
  ctx: PersonalityContext,
): Promise<PersonalityResult> => {
  const todayFormatted = formatCodingTimeMinutes(ctx.todayMinutes);
  const sessionsText = formatSessionsForPrompt(ctx.sessions);

  const prompt = `
Coding time today: ${todayFormatted}
Status: ${ctx.isCurrentlyActive ? "currently active" : "wrapped up"}
Sessions (${ctx.sessions.length}):
${sessionsText}

Narrate what they accomplished during this focus block. No break suggestions.`.trim();

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
      properties: { model: "groq-llama", type: "coach_wellness" },
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
        type: "coach_wellness",
        error: errorMessage.slice(0, 200),
      },
    });

    // Fallback - use first session title if available
    const firstSession = ctx.sessions[0];

    if (firstSession?.title) {
      return {
        headline: `${todayFormatted} focused`,
        subtext: `You've been working on "${firstSession.title}" today.`,
      };
    }

    const project = firstSession?.project ?? "your project";
    return {
      headline: `${todayFormatted} focused`,
      subtext: `You've been ${firstSession?.actionTag ?? "coding"} on ${project} today.`,
    };
  }
};
