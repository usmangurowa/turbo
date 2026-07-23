import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthWithApi, Db } from "../context";
import { createApp } from "../index";

const getDefaultModelMock = vi.hoisted(() => vi.fn());

vi.mock("@turbo/ai/client", () => ({
  getDefaultModel: getDefaultModelMock,
}));

const user = { id: "u1", email: "u@example.com", name: "U" };

const authedStub = {
  api: {
    getSession: () => Promise.resolve({ user, session: {} }),
  },
} as unknown as AuthWithApi;

const unauthedStub = {
  api: {
    getSession: () => Promise.resolve(null),
  },
} as unknown as AuthWithApi;

const stubDb = {} as Db;

const postChat = async (
  auth: AuthWithApi,
  body: Record<string, unknown>,
): Promise<Response> => {
  const app = createApp(auth, stubDb);
  return app.request("/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

const validBody = {
  messages: [{ role: "user", content: "What can you do?" }],
};

/** A mock model that streams "Hello, world!" as three text deltas. */
const streamingMockModel = () =>
  new MockLanguageModelV4({
    doStream: () =>
      Promise.resolve({
        stream: simulateReadableStream({
          chunks: [
            { type: "text-start", id: "text-1" },
            { type: "text-delta", id: "text-1", delta: "Hello" },
            { type: "text-delta", id: "text-1", delta: ", " },
            { type: "text-delta", id: "text-1", delta: "world!" },
            { type: "text-end", id: "text-1" },
            {
              type: "finish",
              finishReason: { unified: "stop", raw: undefined },
              usage: {
                inputTokens: {
                  total: 3,
                  noCache: 3,
                  cacheRead: undefined,
                  cacheWrite: undefined,
                },
                outputTokens: {
                  total: 10,
                  text: 10,
                  reasoning: undefined,
                },
              },
            },
          ],
        }),
      }),
  });

describe("POST /ai/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await postChat(unauthedStub, validBody);
    expect(res.status).toBe(401);
    expect(getDefaultModelMock).not.toHaveBeenCalled();
  });

  it("returns 503 with a setup hint when no provider is configured", async () => {
    getDefaultModelMock.mockReturnValue(null);

    const res = await postChat(authedStub, validBody);

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      error: "No AI provider configured",
      hint: "Set GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY",
    });
  });

  it("rejects an empty messages array with 400", async () => {
    getDefaultModelMock.mockReturnValue(streamingMockModel());

    const res = await postChat(authedStub, { messages: [] });

    expect(res.status).toBe(400);
    expect(getDefaultModelMock).not.toHaveBeenCalled();
  });

  it("streams the model reply as plain text", async () => {
    getDefaultModelMock.mockReturnValue(streamingMockModel());

    const res = await postChat(authedStub, validBody);

    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("Hello, world!");
  });
});
