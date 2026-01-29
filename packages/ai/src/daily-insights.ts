import { generateObject } from "ai";
import { z } from "zod";

import { ANALYTICS_EVENTS } from "@turbo/analytics";
import { trackServerEvent } from "@turbo/analytics/server";
import { formatCodingTime } from "@turbo/shared";

import { modelConfig } from "./client";

/**
 * Input for generating daily insights.
 */
export interface DailyInsightsInput {
  heartbeats: number;
  codingTimeSeconds: number;
  sessions: number;
  flows: number;
  flowEfficiency: number;
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Output from the daily insights generation.
 */
export interface DailyInsightsOutput {
  /** Catchy headline summarizing the day (max 60 chars) */
  headline: string;
  /** Conversational narrative addressing the user (max 220 chars) */
  summary: string;
  /** 3-4 key achievements or observations */
  highlights: string[];
  /** Optional actionable suggestion */
  recommendation?: string;
}

/**
 * Schema for the AI-generated daily insights.
 */
const dailyInsightsSchema = z.object({
  headline: z
    .string()
    .max(60)
    .describe(
      "Catchy, encouraging headline about the day's coding activity (max 60 chars)",
    ),
  summary: z
    .string()
    .max(220)
    .describe(
      "2-3 sentence narrative addressing 'you' directly, describing the day in plain language (max 220 chars)",
    ),
  highlights: z
    .array(z.string())
    .min(3)
    .max(4)
    .describe(
      "3-4 specific observations or achievements from the metrics (e.g., 'Hit 3 flow states', 'Most productive afternoon this week')",
    ),
  recommendation: z
    .string()
    .optional()
    .describe(
      "One actionable, encouraging suggestion based on the data (optional, e.g., 'Try blocking time for deep work tomorrow')",
    ),
});

/**
 * Generate daily insights based on coding metrics.
 *
 * Creates a personalized summary with headline, narrative, highlights,
 * and optional recommendation. Uses the Turbo narrator voice.
 *
 * @example
 * ```ts
 * import { generateDailyInsights } from "@turbo/ai";
 *
 * const insights = await generateDailyInsights({
 *   heartbeats: 450,
 *   codingTimeSeconds: 14400,
 *   sessions: 3,
 *   flows: 2,
 *   flowEfficiency: 65,
 *   dateRange: {
 *     start: "2026-01-21T00:00:00Z",
 *     end: "2026-01-21T23:59:59Z",
 *   },
 * });
 * ```
 */
export const generateDailyInsights = async (
  input: DailyInsightsInput,
): Promise<DailyInsightsOutput> => {
  const {
    heartbeats,
    codingTimeSeconds,
    sessions,
    flows,
    flowEfficiency,
    dateRange,
  } = input;

  // Format coding time for the prompt
  const codingTime = formatCodingTime(codingTimeSeconds);
  const flowTime = formatCodingTime(
    Math.round((codingTimeSeconds * flowEfficiency) / 100),
  );

  // Determine if this is a good, average, or quiet day
  const isProductiveDay = codingTimeSeconds > 7200; // 2+ hours
  const hasFlowStates = flows > 0;
  const highFlowEfficiency = flowEfficiency >= 50;

  const contextHints = [];
  if (isProductiveDay && hasFlowStates) {
    contextHints.push("This is a productive day with good focus");
  } else if (codingTimeSeconds < 1800) {
    contextHints.push("This is a lighter day of coding");
  }
  if (highFlowEfficiency) {
    contextHints.push("High flow efficiency indicates strong focus");
  }

  const prompt = `You are Turbo's AI narrator, providing daily insights for a developer about their coding activity.

**Today's Metrics:**
- Coding time: ${codingTime}
- Heartbeats: ${heartbeats}
- Sessions: ${sessions}
- Flow states: ${flows} (deep focus periods of 20+ minutes)
- Flow efficiency: ${flowEfficiency}% (${flowTime} in flow)
- Date range: ${dateRange.start} to ${dateRange.end}

${contextHints.length > 0 ? `**Context:** ${contextHints.join(". ")}` : ""}

**Generate:**
1. **Headline** (max 60 chars): Catchy, encouraging summary
2. **Summary** (max 220 chars): 2-3 sentences addressing "you" directly, describing the day naturally
3. **Highlights** (3-4 items): Specific observations from the metrics
4. **Recommendation** (optional): One actionable, encouraging suggestion

**Voice Guidelines (Turbo Narrator):**
- Address the user as "you" (not "the team" or third person)
- Never use "I" or "we"
- Use plain language and everyday verbs
- Avoid corporate jargon, marketing speak, or passive voice
- Start summary sentences with verbs when possible
- Be conversational, warm, and encouraging
- Focus on patterns and achievements, not just raw numbers

**Examples:**

**Good Headlines:**
- "Solid focus day with 3 flow states"
- "Steady progress across the board"
- "Building momentum this week"

**Bad Headlines:**
- "Your productivity metrics were analyzed" (passive, corporate)
- "I noticed you had a great day" (uses "I")
- "The team logged 4 hours today" (third person)

**Good Summary:**
"Logged 4 hours of coding time today with 3 distinct flow states. You spent 65% of your time in deep focus, working primarily on the dashboard refactor."

**Bad Summary:**
"Your coding time was 4 hours. The system detected 3 flow states. Flow efficiency was measured at 65%." (robotic, passive)

**Good Highlights:**
- "Hit 3 flow states—your best focus day this week"
- "Maintained 65% flow efficiency throughout"
- "Completed 2 sessions with consistent activity"

**Bad Highlights:**
- "You had 450 heartbeats" (just restating numbers)
- "The metrics show improvement" (vague)

Generate insights that feel natural, encouraging, and actionable.`;

  let lastError: unknown;

  for (const model of modelConfig.models) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelName = (model as any).modelId ?? "unknown";

    try {
      const { object } = await generateObject({
        model,
        schema: dailyInsightsSchema,
        prompt,
        maxRetries: 0,
      });

      trackServerEvent({
        distinctId: "system",
        event: ANALYTICS_EVENTS.AI_MODEL_SUCCESS,
        properties: {
          model: modelName,
          feature: "daily-insights",
        },
      });

      return {
        headline: object.headline.slice(0, 60),
        summary: object.summary.slice(0, 220),
        highlights: object.highlights.map((h) => h.slice(0, 150)),
        recommendation: object.recommendation?.slice(0, 200),
      };
    } catch (error) {
      lastError = error;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      trackServerEvent({
        distinctId: "system",
        event: ANALYTICS_EVENTS.AI_MODEL_FAILED,
        properties: {
          model: modelName,
          error: errorMessage.slice(0, 500),
          feature: "daily-insights",
        },
      });

      console.warn(
        `[AI] Daily insights failed: ${modelName}. Error: ${errorMessage}`,
      );
      continue;
    }
  }

  throw lastError;
};
