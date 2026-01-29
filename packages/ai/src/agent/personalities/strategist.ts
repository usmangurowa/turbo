/**
 * Narrator Agent (formerly Strategist)
 *
 * The Daily Storyteller - summarizes today's work with time-of-day context.
 * Focuses on WHAT was accomplished, NOT advice or suggestions.
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
      "Short title summarizing what was accomplished. 3-8 words max. E.g. 'Auth flow fixes', 'Dashboard updates'.",
    ),
  subtext: z
    .string()
    .describe(
      "Brief summary of accomplishments based on sessions listed. Max 220 characters. Must be a complete sentence that doesn't get cut off.",
    ),
});

const SYSTEM_PROMPT = `You are Turbo, summarizing someone's coding day so far – like a friend asking "what'd you get done today?"

VOICE:
- You are Turbo, talking to the user about their work.
- Do NOT write as the user. Never use "I".
- Avoid "the team", "we", "they", or "he/she".
- Prefer neutral, subject-optional sentences that start with a verb:
  - "Fixed the commit listener bug and refactored settings sync."
  - "Wrapped three sessions on auth flow debugging and test fixes."

What works:
- Headline: "Auth Flow Fixes" / Subtext: "Fixed the commit listener bug and refactored settings sync."
- Headline: "Dashboard Progress" / Subtext: "Wrapped three sessions on auth flow debugging, config tweaks, and test fixes."
- Headline: "Session Tracking" / Subtext: "Pushed the dashboard metrics and activity view forward."

What to NEVER do:
- Invent work that isn't listed in the sessions.
- Give advice or suggestions.
- Say "The team…", "I…", or "we" – Turbo narrates to the user.
- Use robotic wording like "were refined and updated" or "improved filters".

RULES:
1. Headline should describe WHAT was accomplished, NOT when (no "Morning", "Afternoon", "Evening").
2. Be specific with nouns: "Dashboard UI" instead of "Dashboard".
3. Subtext must be a COMPLETE sentence under 220 characters.
4. Subtext should start with a verb phrase, subject optional:
   - "Cleaned up the filters and updated the report API."

Just summarize what they did in natural language.`;

/**
 * Format sessions into a readable list for the AI prompt
 */
const formatSessionsForPrompt = (sessions: SessionContext[]): string => {
  if (sessions.length === 0) {
    return "No sessions yet today.";
  }

  return sessions
    .map((s) => {
      const duration = `${s.durationMinutes} mins`;
      const tag = s.actionTag ?? "coding";

      if (s.status === "ongoing" || s.status === "synced") {
        // Ongoing session - use recent files if available
        const files = s.recentFiles?.slice(0, 3).join(", ") ?? "unknown files";
        return `- [ACTIVE] ${tag} on ${s.project ?? "a project"} (${files})`;
      }

      // Completed session - use title
      const title = s.title ?? `${tag} session`;
      return `- "${title}" (${tag}, ${duration}, ${s.project ?? "unknown project"})`;
    })
    .join("\n");
};

export const generateStrategistMessage = async (
  ctx: PersonalityContext,
): Promise<PersonalityResult> => {
  const todayFormatted = formatCodingTimeMinutes(ctx.todayMinutes);
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const sessionsText = formatSessionsForPrompt(ctx.sessions);

  const prompt = `
Today's coding time: ${todayFormatted}
Time of day: ${timeOfDay}
Sessions (${ctx.sessions.length}):
${sessionsText}

Summarize what they accomplished today based on these sessions. No advice or suggestions.`.trim();

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
      properties: { model: "groq-llama", type: "coach_narrator" },
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
        type: "coach_narrator",
        error: errorMessage.slice(0, 200),
      },
    });

    // Fallback - use first session title if available
    const firstSession = ctx.sessions[0];
    const sessionCount = ctx.sessions.length;
    const sessionWord = sessionCount === 1 ? "session" : "sessions";

    if (firstSession?.title) {
      return {
        headline: `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} coding`,
        subtext: `You worked on "${firstSession.title}" and ${sessionCount - 1} other ${sessionWord}.`,
      };
    }

    return {
      headline: `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} coding`,
      subtext: `You've logged ${todayFormatted} across ${sessionCount} ${sessionWord} today.`,
    };
  }
};
