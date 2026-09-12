import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sendSupportEmail } from "../tasks/send-support-email";

const sendEmailMock = vi.hoisted(() => vi.fn());

vi.mock("@turbo/mail/client", () => ({
  DEFAULT_FROM: "no-reply@turbo.app",
  sendEmail: sendEmailMock,
}));

const payload = {
  userEmail: "u@example.com",
  userId: "u1",
  type: "bug",
  message: "Something is broken and needs a fix",
};

describe("sendSupportEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SUPPORT_INBOX_EMAIL;
  });

  afterEach(() => {
    delete process.env.SUPPORT_INBOX_EMAIL;
  });

  it("sends to DEFAULT_FROM with the user as reply-to and returns the id", async () => {
    sendEmailMock.mockResolvedValue({ success: true, id: "email_1" });

    await expect(sendSupportEmail(payload)).resolves.toEqual({
      emailId: "email_1",
    });

    expect(sendEmailMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "no-reply@turbo.app",
        subject: "[Support] bug",
        replyTo: "u@example.com",
      }),
    );
  });

  it("prefers SUPPORT_INBOX_EMAIL as the recipient", async () => {
    process.env.SUPPORT_INBOX_EMAIL = "support@example.com";
    sendEmailMock.mockResolvedValue({ success: true, id: "email_2" });

    await sendSupportEmail(payload);

    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "support@example.com" }),
    );
  });

  it("throws the provider error so the queue retries", async () => {
    const error = new Error("Resend is down");
    sendEmailMock.mockResolvedValue({ success: false, error });

    await expect(sendSupportEmail(payload)).rejects.toBe(error);
  });

  it("throws a fallback error when the provider gives none", async () => {
    sendEmailMock.mockResolvedValue({ success: false });

    await expect(sendSupportEmail(payload)).rejects.toThrow(
      "Failed to send support email",
    );
  });
});
