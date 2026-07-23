import { afterEach, describe, expect, it, vi } from "vitest";

import {
  geminiFlash,
  getDefaultModel,
  groqLlama,
  openRouterGemini,
} from "../client";

const PROVIDER_ENV_VARS = [
  "GOOGLE_GENERATIVE_AI_API_KEY",
  "GROQ_API_KEY",
  "OPENROUTER_API_KEY",
] as const;

const clearProviderEnv = () => {
  for (const envVar of PROVIDER_ENV_VARS) {
    vi.stubEnv(envVar, "");
  }
};

describe("getDefaultModel", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when no provider key is configured", () => {
    clearProviderEnv();
    expect(getDefaultModel()).toBeNull();
  });

  it("treats empty-string keys as not configured", () => {
    clearProviderEnv();
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");
    expect(getDefaultModel()).toBeNull();
  });

  it("prefers Google when its key is configured", () => {
    clearProviderEnv();
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "test-google-key");
    vi.stubEnv("GROQ_API_KEY", "test-groq-key");
    vi.stubEnv("OPENROUTER_API_KEY", "test-openrouter-key");
    expect(getDefaultModel()).toBe(geminiFlash);
  });

  it("falls back to Groq when Google is not configured", () => {
    clearProviderEnv();
    vi.stubEnv("GROQ_API_KEY", "test-groq-key");
    vi.stubEnv("OPENROUTER_API_KEY", "test-openrouter-key");
    expect(getDefaultModel()).toBe(groqLlama);
  });

  it("falls back to OpenRouter when only its key is configured", () => {
    clearProviderEnv();
    vi.stubEnv("OPENROUTER_API_KEY", "test-openrouter-key");
    expect(getDefaultModel()).toBe(openRouterGemini);
  });
});
