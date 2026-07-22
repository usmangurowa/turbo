import { describe, expect, it } from "vitest";

import {
  createGeminiModel,
  createGoogleAI,
  geminiFlash,
  geminiPro,
  googleAI,
  groq,
  groqLlama,
  modelConfig,
  openRouter,
  openRouterGemini,
  openRouterLlama,
  openRouterMistral,
} from "../client";

describe("@turbo/ai client", () => {
  it("exposes googleAI as a function (provider)", () => {
    expect(typeof googleAI).toBe("function");
  });

  it("exposes openRouter as a function (provider)", () => {
    expect(typeof openRouter).toBe("function");
  });

  it("exposes groq as a function (provider)", () => {
    expect(typeof groq).toBe("function");
  });

  it("createGoogleAI returns a provider function", () => {
    const provider = createGoogleAI({ apiKey: "test-key" });
    expect(typeof provider).toBe("function");
  });

  it("createGeminiModel returns a model object", () => {
    const model = createGeminiModel("gemini-3-flash");
    expect(model).toBeDefined();
    expect(typeof model).toBe("object");
  });

  it("pre-built model instances are defined objects", () => {
    expect(geminiFlash).toBeDefined();
    expect(geminiPro).toBeDefined();
    expect(openRouterGemini).toBeDefined();
    expect(openRouterLlama).toBeDefined();
    expect(openRouterMistral).toBeDefined();
    expect(groqLlama).toBeDefined();
  });

  it("modelConfig.models is a non-empty array", () => {
    expect(Array.isArray(modelConfig.models)).toBe(true);
    expect(modelConfig.models.length).toBeGreaterThan(0);
  });
});
