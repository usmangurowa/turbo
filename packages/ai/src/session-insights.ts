import { generateObject } from "ai";
import { z } from "zod";

import { ANALYTICS_EVENTS } from "@turbo/analytics";
import { trackServerEvent } from "@turbo/analytics/server";
import { sanitizeArrayForPrompt, sanitizeForPrompt } from "@turbo/shared";

import { modelConfig } from "./client";

/**
 * Input for generating session insights.
 */
export interface SessionInsightsInput {
  title: string;
  summary?: string;
  topFiles: string[];
  languages: { name: string; percentage: number }[];
  commits: { message: string }[];
  durationMinutes: number;
  project: string;
  branch?: string;
  actionTag?: string;
  /** Number of intensity peaks in the activity timeline */
  activityPeaks: number;
}

/**
 * Output from the session insights generation.
 */
export interface SessionInsightsOutput {
  /** 2-3 sentence narrative of what happened */
  story: string;
  /** 2-4 curated proof bullets */
  proofBullets: string[];
  /** 1-2 pattern observations */
  patterns: string[];
  /** 3 alternative title suggestions */
  titleSuggestions: string[];
}

/**
 * Schema for the AI-generated session insights.
 */
const sessionInsightsSchema = z.object({
  story: z
    .string()
    .describe(
      "A 2-3 sentence narrative of what happened in the session, past tense, addressing the developer directly",
    ),
  proofBullets: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe(
      "2-4 curated facts about the session (most active files, work type, commits)",
    ),
  patterns: z
    .array(z.string())
    .min(1)
    .max(2)
    .describe(
      "1-2 non-obvious pattern observations about the work style or session structure",
    ),
  titleSuggestions: z
    .array(z.string())
    .length(3)
    .describe(
      "3 alternative action-oriented titles for this session (max 5 words each)",
    ),
});

/**
 * Generate narrative insights for a coding session.
 *
 * Creates a story, proof bullets, patterns, and title suggestions
 * based on session metadata. Does NOT repeat raw metrics.
 *
 * @example
 * ```ts
 * import { generateSessionInsights } from "@turbo/ai";
 *
 * const insights = await generateSessionInsights({
 *   title: "Dashboard Refactor",
 *   topFiles: ["page.tsx", "layout.tsx"],
 *   languages: [{ name: "TypeScript", percentage: 80 }],
 *   commits: [{ message: "Refactor dashboard layout" }],
 *   durationMinutes: 45,
 *   project: "turbo-web",
 *   activityPeaks: 3,
 * });
 * ```
 */
export const generateSessionInsights = async (
  input: SessionInsightsInput,
): Promise<SessionInsightsOutput> => {
  const {
    title,
    summary,
    topFiles,
    languages,
    commits,
    durationMinutes,
    project,
    branch,
    actionTag,
    activityPeaks,
  } = input;

  // Sanitize all user inputs
  const safeTitle = sanitizeForPrompt(title, 100);
  const safeSummary = summary ? sanitizeForPrompt(summary, 300) : undefined;
  const safeTopFiles = sanitizeArrayForPrompt(topFiles.slice(0, 10));
  const safeLanguages = languages.slice(0, 5).map((l) => ({
    name: sanitizeForPrompt(l.name, 30),
    percentage: l.percentage,
  }));
  const safeCommits = commits.slice(0, 5).map((c) => ({
    message: sanitizeForPrompt(c.message, 150),
  }));
  const safeProject = sanitizeForPrompt(project, 50);
  const safeBranch = branch ? sanitizeForPrompt(branch, 100) : undefined;
  const safeActionTag = actionTag
    ? sanitizeForPrompt(actionTag, 30)
    : undefined;

  // Build metadata block
  const metadataLines = [
    `- Title: ${safeTitle}`,
    ...(safeSummary ? [`- Existing summary: ${safeSummary}`] : []),
    `- Project: ${safeProject}`,
    ...(safeBranch ? [`- Branch: ${safeBranch}`] : []),
    `- Duration: ${durationMinutes} minutes`,
    ...(safeActionTag ? [`- Work type: ${safeActionTag}`] : []),
    `- Activity peaks: ${activityPeaks} (intensity spikes in timeline)`,
    `- Top files: ${safeTopFiles.join(", ") || "none recorded"}`,
    `- Languages: ${safeLanguages.map((l) => `${l.name} (${l.percentage}%)`).join(", ") || "none recorded"}`,
    ...(safeCommits.length > 0
      ? [
          `- Commits (${safeCommits.length}):`,
          ...safeCommits.map((c) => `  • "${c.message}"`),
        ]
      : []),
  ].join("\n");

  const prompt = `You are a coding activity analyst generating insights for a developer about their coding session.

Based on the session metadata below, generate:
1. A **story** (2-3 sentences) that describes what happened in narrative form
2. **Proof bullets** (2-4) that highlight key facts (curated, not restating all data)
3. **Patterns** (1-2) that are non-obvious observations about work style
4. **Title suggestions** (3) that are better, action-oriented alternatives to the current title

**Session Metadata:**
${metadataLines}

**Rules:**
1. Story should be past tense, addressing "you" (the developer)
2. Story should synthesize the metadata into a coherent narrative, not list facts
3. Proof bullets should SELECT the most relevant facts, not repeat everything
4. Patterns should interpret the data (e.g., "multiple peaks suggest build/check cycles")
5. Do NOT give productivity advice or coaching
6. Do NOT restate percentages or raw numbers verbatim—interpret them
7. Title suggestions should be action-oriented (e.g., "Dashboard Layout Overhaul")
8. If commits are present, prioritize them as the source of truth for what happened

**Example patterns to detect:**
- Multiple activity peaks → "Work came in focused bursts, likely alternating between coding and verifying"
- Many files, low commit count → "Exploratory work across the codebase without committing"
- Few files, high activity → "Deep focus on a specific area"
- Mixed languages → "Context switching between frontend and config/tooling"`;

  let lastError: unknown;

  for (const model of modelConfig.models) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelName = (model as any).modelId ?? "unknown";

    try {
      const { object } = await generateObject({
        model,
        schema: sessionInsightsSchema,
        prompt,
        maxRetries: 0,
      });

      trackServerEvent({
        distinctId: "system",
        event: ANALYTICS_EVENTS.AI_MODEL_SUCCESS,
        properties: {
          model: modelName,
          feature: "session-insights",
        },
      });

      return {
        story: object.story.slice(0, 500),
        proofBullets: object.proofBullets.map((b) => b.slice(0, 200)),
        patterns: object.patterns.map((p) => p.slice(0, 300)),
        titleSuggestions: object.titleSuggestions.map((t) => t.slice(0, 50)),
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
          feature: "session-insights",
        },
      });

      console.warn(
        `[AI] Session insights failed: ${modelName}. Error: ${errorMessage}`,
      );
      continue;
    }
  }

  throw lastError;
};
