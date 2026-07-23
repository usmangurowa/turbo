import type { LanguageModel } from "ai";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import type { GeminiModelId, GoogleAIOptions } from "./types";

export type { GeminiModelId, GoogleAIOptions };

/**
 * Default Google Generative AI provider instance.
 * Uses GOOGLE_GENERATIVE_AI_API_KEY environment variable by default.
 *
 * @example
 * ```ts
 * import { googleAI } from "@turbo/ai/client";
 * import { generateText } from "@turbo/ai";
 *
 * const { text } = await generateText({
 *   model: googleAI("gemini-3-flash"),
 *   prompt: "Hello!",
 * });
 * ```
 */
export const googleAI = google;

/**
 * OpenRouter provider instance for fallback when Google rate limits are hit.
 * Uses OPENROUTER_API_KEY environment variable.
 */
export const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Create a custom Google Generative AI provider instance.
 *
 * @example
 * ```ts
 * import { createGoogleAI } from "@turbo/ai/client";
 *
 * const customGoogle = createGoogleAI({
 *   apiKey: "custom-api-key",
 * });
 *
 * const model = customGoogle("gemini-3-flash");
 * ```
 */
export const createGoogleAI = (options?: GoogleAIOptions) =>
  createGoogleGenerativeAI(options);

/**
 * Pre-configured Gemini 3 Flash model (Google direct).
 * Fast, efficient with Pro-grade reasoning for high-volume tasks.
 */
export const geminiFlash: LanguageModel = google("gemini-3-flash");

/**
 * OpenRouter Gemini 2.0 Flash model (FREE tier).
 * More generous rate limits than Google direct API.
 */
export const openRouterGemini: LanguageModel = openRouter(
  "google/gemini-2.0-flash-exp:free",
);

/**
 * OpenRouter Llama 3.3 70B model (FREE tier).
 * High quality alternative to Gemini.
 */
export const openRouterLlama: LanguageModel = openRouter(
  "meta-llama/llama-3.3-70b-instruct:free",
);

/**
 * OpenRouter Mistral 7B model (FREE tier).
 * Reliable backup model.
 */
export const openRouterMistral: LanguageModel = openRouter(
  "mistralai/mistral-7b-instruct:free",
);

/**
 * Groq provider instance.
 * Uses GROQ_API_KEY environment variable.
 * Independent rate limits from OpenRouter.
 */
export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Groq Llama 4 Scout model.
 * Supports structured outputs (json_schema).
 * Independent free tier from OpenRouter.
 */
export const groqLlama: LanguageModel = groq(
  "meta-llama/llama-4-scout-17b-16e-instruct",
);

/**
 * Model configuration for fallback cycling.
 * The system will try each model in the 'models' array in order.
 */
export const modelConfig = {
  /**
   * List of models to try in sequence.
   * Order optimized for maximum reliability:
   * 1. Groq (highest limits, fastest) - 14k/day FREE
   * 2-4. OpenRouter models (paid buffer with $10 credits)
   * 5. Google Direct (emergency fallback, strictest limits)
   */
  models: [
    groqLlama, // Primary: Llama 3.3 70B via Groq (30 RPM, 14k/day FREE)
    openRouterGemini, // Fallback 1: Gemini 2.0 Flash (paid buffer)
    openRouterMistral, // Fallback 2: Mistral 7B (lightweight)
    openRouterLlama, // Fallback 3: Llama 3.3 70B via OpenRouter
    geminiFlash, // Emergency: Google Direct Gemini 3 Flash (15 RPM, strict)
  ],
} as const;

/**
 * Pre-configured Gemini 3 Pro model.
 * Most intelligent model with advanced reasoning and 1M token context.
 *
 * @example
 * ```ts
 * import { geminiPro } from "@turbo/ai/client";
 * import { generateText } from "@turbo/ai";
 *
 * const { text } = await generateText({
 *   model: geminiPro,
 *   prompt: "Explain quantum computing.",
 * });
 * ```
 */
export const geminiPro: LanguageModel = google("gemini-3-pro");

/**
 * Create a Gemini model instance with a specific model ID.
 *
 * @example
 * ```ts
 * import { createGeminiModel } from "@turbo/ai/client";
 * import { generateText } from "@turbo/ai";
 *
 * const model = createGeminiModel("gemini-1.5-pro");
 *
 * const { text } = await generateText({
 *   model,
 *   prompt: "Hello!",
 * });
 * ```
 */
export const createGeminiModel = (modelId: GeminiModelId): LanguageModel =>
  google(modelId);

/**
 * Return the default model of the first configured provider, checked in
 * order: Google → Groq → OpenRouter. A provider counts as configured when
 * its API key environment variable is set to a non-empty value at call time,
 * so the zero-env template resolves to `null` and callers can degrade
 * gracefully (e.g. an API route returning 503) instead of crashing.
 *
 * @example
 * ```ts
 * import { getDefaultModel } from "@turbo/ai/client";
 *
 * const model = getDefaultModel();
 * if (!model) {
 *   // no provider configured — return a 503 or render a setup hint
 * }
 * ```
 */
export const getDefaultModel = (): LanguageModel | null => {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return geminiFlash;
  if (process.env.GROQ_API_KEY) return groqLlama;
  if (process.env.OPENROUTER_API_KEY) return openRouterGemini;
  return null;
};
