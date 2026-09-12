import { describe, expect, it } from "vitest";

import { jobHandlers, jobNames } from "../handlers";
import { QUEUE_POLICY } from "../queues";
import { sendSupportEmail } from "../tasks/send-support-email";

describe("job registry", () => {
  it("maps every queue name to its handler", () => {
    expect(jobNames).toEqual(["send-support-email"]);
    expect(jobHandlers["send-support-email"]).toBe(sendSupportEmail);
  });

  it("keeps the three-attempt, capped-backoff, five-minute policy", () => {
    expect(QUEUE_POLICY).toEqual({
      retryLimit: 2,
      retryDelay: 1,
      retryBackoff: true,
      retryDelayMax: 10,
      expireInSeconds: 300,
    });
  });
});
