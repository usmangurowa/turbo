# @turbo/ai

AI provider wiring for the Turbo stack.

## What's here

- **`src/client.ts`** — pre-configured provider instances and model constants: Google Gemini (direct), OpenRouter (Gemini, Llama, Mistral), Groq (Llama 4 Scout), and a `modelConfig` fallback array ordered for reliability.
- **`src/types.ts`** — shared type re-exports from the AI SDK (`AIMessage`, `ModelMessage`) and local types (`GeminiModelId`, `GoogleAIOptions`, `GenerateTextOptions`, `ChatOptions`).

## Exports

```ts
import type { AIMessage, GeminiModelId } from "@turbo/ai";
import { googleAI, groq, modelConfig, openRouter } from "@turbo/ai/client";
```

## What's planned

Agent orchestration, session summarisation, daily insights, and standup generation. When the first agent lands, add it to `src/agent/` and export it from `src/index.ts`.

## Environment variables

| Variable                       | Used by                              |
| ------------------------------ | ------------------------------------ |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `googleAI` (default Google provider) |
| `OPENROUTER_API_KEY`           | `openRouter` provider                |
| `GROQ_API_KEY`                 | `groq` provider                      |
