import { beforeAll, describe, expect, it, vi } from "vitest";

delete process.env.RESEND_API_KEY;

// The env change above must precede the module load, hence the dynamic
// imports — done once here under the hook timeout so no test times a cold
// react-email/resend import on a busy runner.
let client: typeof import("../client");
let OTPEmail: typeof import("../templates/otp").OTPEmail;

beforeAll(async () => {
  client = await import("../client");
  ({ OTPEmail } = await import("../templates/otp"));
});

describe("sendEmail (mock transport, no RESEND_API_KEY)", () => {
  it("returns success with a mock id", async () => {
    const { sendEmail } = client;
    const result = await sendEmail({
      to: "user@example.com",
      subject: "Test",
      template: OTPEmail({ otp: "123456", type: "sign-in" }),
    });
    expect(result.success).toBe(true);
    expect(result.id).toMatch(/^mock_email_/);
  });

  it("sendOTPEmail picks the right subject per type", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { sendOTPEmail } = client;
    const result = await sendOTPEmail({
      to: "user@example.com",
      otp: "123456",
      type: "email-verification",
    });
    expect(result.success).toBe(true);
    expect(warn.mock.calls.flat().join(" ")).toContain("Verify your email");
    warn.mockRestore();
  });

  it("renderEmail produces HTML containing the OTP", async () => {
    const { renderEmail } = client;
    const html = await renderEmail(
      OTPEmail({ otp: "654321", type: "sign-in" }),
    );
    expect(html).toContain("654321");
  });
});
