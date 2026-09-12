import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as JobsClient from "@turbo/jobs/client";

import type { AuthWithApi, Db } from "../context";
import { createApp } from "../index";

const sendEmailMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ success: true, id: "mock_email_test" }),
);
const enqueueMock = vi.hoisted(() => vi.fn().mockResolvedValue("job_test"));

vi.mock("@turbo/mail/client", () => ({
  DEFAULT_FROM: "no-reply@turbo.app",
  sendEmail: sendEmailMock,
}));

// Keep the real JOBS_POSTGRES_URL gate; only the send itself is stubbed.
vi.mock("@turbo/jobs/client", async (importOriginal) => ({
  ...(await importOriginal<typeof JobsClient>()),
  enqueue: enqueueMock,
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

const postSupport = async (
  auth: AuthWithApi,
  body: Record<string, unknown>,
): Promise<Response> => {
  const app = createApp(auth, stubDb);
  return app.request("/support", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

const validBody = {
  type: "bug",
  message: "Something is broken and needs a fix",
};

describe("POST /support", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.JOBS_POSTGRES_URL;
  });

  afterEach(() => {
    delete process.env.JOBS_POSTGRES_URL;
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await postSupport(unauthedStub, validBody);
    expect(res.status).toBe(401);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("sends the support email in-process when JOBS_POSTGRES_URL is unset", async () => {
    const res = await postSupport(authedStub, validBody);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      message: "Support request received",
    });

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: "u@example.com",
        subject: "[Support] bug",
        to: "no-reply@turbo.app",
      }),
    );
    expect(enqueueMock).not.toHaveBeenCalled();
  });

  it("enqueues the send-support-email job when JOBS_POSTGRES_URL is set", async () => {
    process.env.JOBS_POSTGRES_URL = "postgres://localhost/jobs";

    const res = await postSupport(authedStub, validBody);

    expect(res.status).toBe(200);
    expect(enqueueMock).toHaveBeenCalledTimes(1);
    expect(enqueueMock).toHaveBeenCalledWith("send-support-email", {
      userEmail: "u@example.com",
      userId: "u1",
      type: "bug",
      message: validBody.message,
      metadata: undefined,
    });
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("rejects messages shorter than 10 characters with 400", async () => {
    const res = await postSupport(authedStub, {
      type: "bug",
      message: "too short",
    });
    expect(res.status).toBe(400);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});
