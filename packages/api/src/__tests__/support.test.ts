import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthWithApi, Db } from "../context";
import { createApp } from "../index";

const sendEmailMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ success: true, id: "mock_email_test" }),
);
const triggerMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ id: "run_test" }),
);

vi.mock("@turbo/mail/client", () => ({
  DEFAULT_FROM: "no-reply@turbo.app",
  sendEmail: sendEmailMock,
}));

vi.mock("@trigger.dev/sdk", () => ({
  tasks: { trigger: triggerMock },
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
    delete process.env.TRIGGER_SECRET_KEY;
  });

  afterEach(() => {
    delete process.env.TRIGGER_SECRET_KEY;
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await postSupport(unauthedStub, validBody);
    expect(res.status).toBe(401);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("sends the support email in-process when TRIGGER_SECRET_KEY is unset", async () => {
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
    expect(triggerMock).not.toHaveBeenCalled();
  });

  it("enqueues the Trigger.dev task when TRIGGER_SECRET_KEY is set", async () => {
    process.env.TRIGGER_SECRET_KEY = "tr_dev_test";

    const res = await postSupport(authedStub, validBody);

    expect(res.status).toBe(200);
    expect(triggerMock).toHaveBeenCalledTimes(1);
    expect(triggerMock).toHaveBeenCalledWith("send-support-email", {
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
