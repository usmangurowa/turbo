import { generateObject } from "ai";
import { z } from "zod";

import { ANALYTICS_EVENTS } from "@turbo/analytics";
import { trackServerEvent } from "@turbo/analytics/server";
import { sanitizeArrayForPrompt, sanitizeForPrompt } from "@turbo/shared";

import { modelConfig } from "./client";

/**
 * Input for generating a session summary.
 */
export interface SessionSummaryInput {
  files: string[];
  languages: string[];
  branch?: string;
  project: string;
  durationMinutes: number;
  /** Function/class names touched during the session (opt-in) */
  symbols?: string[];
  /** Lines added during the session */
  linesAdded?: number;
  /** Lines deleted during the session */
  linesDeleted?: number;
  /** Commits made during the session */
  commits?: {
    message: string;
    filesChanged?: number;
    insertions?: number;
    deletions?: number;
  }[];
}

/**
 * Action tags that describe what kind of work happened in a session.
 */
export const ACTION_TAGS = [
  "building",
  "refactoring",
  "debugging",
  "testing",
  "reviewing",
  "configuring",
] as const;

export type ActionTag = (typeof ACTION_TAGS)[number];

/**
 * Output from the session summary generation.
 */
export interface SessionSummaryOutput {
  title: string;
  summary: string;
  actionTag: ActionTag;
}

/**
 * Schema for the AI-generated session summary.
 */
const sessionSummarySchema = z.object({
  title: z.string().describe("A short, action-oriented title (max 5 words)"),
  summary: z
    .string()
    .describe("A brief summary of what was accomplished (1-2 sentences)"),
  actionTag: z
    .enum(ACTION_TAGS)
    .describe(
      "The type of work done: building (new features), refactoring (restructuring), debugging (fixing issues), testing (tests), reviewing (exploring code), configuring (setup/config)",
    ),
});

/**
 * Generate a meaningful title and summary for a coding session.
 *
 * Uses multi-model fallback with automatic switching on errors.
 * Tracks model success/failure in PostHog for reliability monitoring.
 *
 * Security: All inputs are sanitized to prevent prompt injection, and
 * outputs are sanitized to prevent XSS when rendered in UI.
 *
 * @example
 * ```ts
 * import { generateSessionSummary } from "@turbo/ai/session";
 *
 * const result = await generateSessionSummary({
 *   files: ["auth.ts", "login.tsx"],
 *   languages: ["TypeScript"],
 *   branch: "fix/login-bug",
 *   project: "turbo",
 *   durationMinutes: 45,
 * });
 *
 * console.log(result.title); // "Login Bug Fix"
 * console.log(result.summary); // "Fixed authentication issues in the login flow."
 * console.log(result.actionTag); // "debugging"
 * ```
 */
export const generateSessionSummary = async (
  input: SessionSummaryInput,
): Promise<SessionSummaryOutput> => {
  const {
    files,
    languages,
    branch,
    project,
    durationMinutes,
    symbols,
    linesAdded,
    linesDeleted,
    commits,
  } = input;

  // Sanitize all user inputs to prevent prompt injection
  const safeFiles = sanitizeArrayForPrompt([...new Set(files)].slice(0, 20));
  const safeLanguages = sanitizeArrayForPrompt([...new Set(languages)]);
  const safeBranch = branch ? sanitizeForPrompt(branch, 100) : undefined;
  const safeProject = sanitizeForPrompt(project, 100);
  const safeSymbols = symbols?.length
    ? sanitizeArrayForPrompt([...new Set(symbols)].slice(0, 30))
    : undefined;

  // Format commits as sanitized list
  const safeCommits = commits?.slice(0, 5).map((c) => ({
    message: sanitizeForPrompt(c.message, 200),
    filesChanged: c.filesChanged,
    insertions: c.insertions,
    deletions: c.deletions,
  }));

  // Build metadata lines with sanitized values
  const metadataLines = [
    `- Project: ${safeProject}`,
    `- Duration: ${durationMinutes} minutes`,
    `- Languages: ${safeLanguages.join(", ")}`,
    ...(safeBranch ? [`- Branch: ${safeBranch}`] : []),
    `- Files touched: ${safeFiles.join(", ")}`,
    ...(safeSymbols
      ? [`- Functions/classes worked on: ${safeSymbols.join(", ")}`]
      : []),
    ...(linesAdded !== undefined ? [`- Lines added: ${linesAdded}`] : []),
    ...(linesDeleted !== undefined ? [`- Lines deleted: ${linesDeleted}`] : []),
    ...(safeCommits && safeCommits.length > 0
      ? [
          `- Commits made:`,
          ...safeCommits.map(
            (c) =>
              `  * "${c.message}"${c.filesChanged ? ` (${c.filesChanged} files, +${c.insertions ?? 0}/-${c.deletions ?? 0})` : ""}`,
          ),
        ]
      : []),
  ].join("\n");

  const prompt = `You are an AI assistant that generates concise, meaningful titles, summaries, and action tags for coding sessions.

Based on the following coding session metadata, generate:
1. A short title (max 5 words)
2. A brief summary (1-2 sentences)
3. An action tag that best describes the type of work done

**Action Tag Options:**
- building: Creating new features or code (high lines added, new files)
- refactoring: Restructuring existing code (similar add/delete ratio)
- debugging: Fixing issues (small focused changes, bug-related files)
- testing: Writing or running tests (test files like .test.ts, .spec.ts)
- reviewing: Reading and exploring code (low write activity, many files viewed)
- configuring: Setup and configuration work (config files like .json, .yml, .env)

**Session Metadata:**
${metadataLines}

**Rules:**
1. Title should be action-oriented (e.g., "Auth System Refactor", "Bug Fix in Login", "API Endpoint Updates")
2. Don't include generic words like "coding" or "work"
3. Summary should explain what was likely accomplished based on the file names${safeBranch ? ", branch name" : ""}${safeSymbols ? ", function/class names" : ""}${safeCommits?.length ? ", commit messages" : ""} and project name
4. Pick the single most fitting action tag based on the context
5. If commit messages are provided, use them as the primary source of truth for what was accomplished`;

  let lastError: unknown;

  // Cycle through available models until one succeeds
  for (const model of modelConfig.models) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const modelName = (model as any).modelId ?? "unknown";

    try {
      const { object } = await generateObject({
        model,
        schema: sessionSummarySchema,
        prompt,
        maxRetries: 0,
      });

      // Track successful model usage
      trackServerEvent({
        distinctId: "system",
        event: ANALYTICS_EVENTS.AI_MODEL_SUCCESS,
        properties: {
          model: modelName,
          project: safeProject,
        },
      });

      return {
        title: object.title.slice(0, 100),
        summary: object.summary.slice(0, 500),
        actionTag: object.actionTag,
      };
    } catch (error) {
      lastError = error;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Track model failure
      trackServerEvent({
        distinctId: "system",
        event: ANALYTICS_EVENTS.AI_MODEL_FAILED,
        properties: {
          model: modelName,
          error: errorMessage.slice(0, 500), // Truncate long errors
          project: safeProject,
        },
      });

      console.warn(`[AI] Model failed: ${modelName}. Error: ${errorMessage}`);
      continue;
    }
  }

  // If all models fail, throw the last error
  throw lastError;
};
