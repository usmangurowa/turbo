import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  closeJobQueue,
  enqueue,
  getJobsConnectionString,
  isJobQueueConfigured,
} from "../client";
import { QUEUE_POLICY } from "../queues";

const boss = vi.hoisted(() => ({
  on: vi.fn(),
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  createQueue: vi.fn().mockResolvedValue(undefined),
  send: vi.fn().mockResolvedValue("job_1"),
}));
const PgBossMock = vi.hoisted(() =>
  vi.fn(function PgBoss() {
    return boss;
  }),
);

vi.mock("pg-boss", () => ({ PgBoss: PgBossMock }));

const payload = {
  userEmail: "u@example.com",
  type: "bug",
  message: "Something is broken and needs a fix",
};

describe("jobs client", () => {
  beforeEach(async () => {
    await closeJobQueue();
    vi.clearAllMocks();
    delete process.env.JOBS_POSTGRES_URL;
  });

  afterEach(async () => {
    await closeJobQueue();
    delete process.env.JOBS_POSTGRES_URL;
  });

  it("is unconfigured when JOBS_POSTGRES_URL is unset or empty", () => {
    expect(isJobQueueConfigured()).toBe(false);
    expect(getJobsConnectionString()).toBeUndefined();

    process.env.JOBS_POSTGRES_URL = "";
    expect(isJobQueueConfigured()).toBe(false);
  });

  it("is configured when JOBS_POSTGRES_URL is set", () => {
    process.env.JOBS_POSTGRES_URL = "postgres://localhost/jobs";
    expect(isJobQueueConfigured()).toBe(true);
    expect(getJobsConnectionString()).toBe("postgres://localhost/jobs");
  });

  it("refuses to enqueue without a connection string", async () => {
    await expect(enqueue("send-support-email", payload)).rejects.toThrow(
      "JOBS_POSTGRES_URL is not set",
    );
    expect(PgBossMock).not.toHaveBeenCalled();
  });

  it("starts a send-only producer once and reuses it", async () => {
    process.env.JOBS_POSTGRES_URL = "postgres://localhost/jobs";

    await expect(enqueue("send-support-email", payload)).resolves.toBe("job_1");
    await enqueue("send-support-email", payload);

    expect(PgBossMock).toHaveBeenCalledTimes(1);
    expect(PgBossMock).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionString: "postgres://localhost/jobs",
        supervise: false,
        schedule: false,
      }),
    );
    expect(boss.start).toHaveBeenCalledTimes(1);
    expect(boss.createQueue).toHaveBeenCalledTimes(1);
    expect(boss.createQueue).toHaveBeenCalledWith(
      "send-support-email",
      QUEUE_POLICY,
    );
    expect(boss.send).toHaveBeenCalledTimes(2);
    expect(boss.send).toHaveBeenCalledWith(
      "send-support-email",
      payload,
      undefined,
    );
  });

  it("forwards send options", async () => {
    process.env.JOBS_POSTGRES_URL = "postgres://localhost/jobs";

    await enqueue("send-support-email", payload, { singletonKey: "u1" });

    expect(boss.send).toHaveBeenCalledWith("send-support-email", payload, {
      singletonKey: "u1",
    });
  });

  it("drops a failed start so the next enqueue retries", async () => {
    process.env.JOBS_POSTGRES_URL = "postgres://localhost/jobs";
    boss.start.mockRejectedValueOnce(new Error("connection refused"));

    await expect(enqueue("send-support-email", payload)).rejects.toThrow(
      "connection refused",
    );
    await expect(enqueue("send-support-email", payload)).resolves.toBe("job_1");

    expect(PgBossMock).toHaveBeenCalledTimes(2);
  });

  it("stops the producer on close and starts fresh afterwards", async () => {
    process.env.JOBS_POSTGRES_URL = "postgres://localhost/jobs";

    await enqueue("send-support-email", payload);
    await closeJobQueue();

    expect(boss.stop).toHaveBeenCalledTimes(1);

    await enqueue("send-support-email", payload);

    expect(PgBossMock).toHaveBeenCalledTimes(2);
    expect(boss.createQueue).toHaveBeenCalledTimes(2);
  });
});
