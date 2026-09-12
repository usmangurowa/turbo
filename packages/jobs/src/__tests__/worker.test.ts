import { beforeEach, describe, expect, it, vi } from "vitest";

import { QUEUE_POLICY } from "../queues";
import { createWorker } from "../worker";

type WorkHandler = (
  jobs: { id: string; name: string; data: object }[],
) => Promise<void>;

const boss = vi.hoisted(() => ({
  on: vi.fn(),
  start: vi.fn().mockResolvedValue(undefined),
  stop: vi.fn().mockResolvedValue(undefined),
  createQueue: vi.fn().mockResolvedValue(undefined),
  work: vi.fn().mockResolvedValue("worker_1"),
}));
const PgBossMock = vi.hoisted(() =>
  vi.fn(function PgBoss() {
    return boss;
  }),
);
const handlerMock = vi.hoisted(() => vi.fn());

vi.mock("pg-boss", () => ({ PgBoss: PgBossMock }));
vi.mock("../handlers", () => ({
  jobHandlers: { "send-support-email": handlerMock },
  jobNames: ["send-support-email"],
}));

const connectionString = "postgres://localhost/jobs";

const registeredHandler = (): WorkHandler => {
  const call = boss.work.mock.calls[0] as unknown[] | undefined;
  const handler = call?.at(-1);
  if (typeof handler !== "function") throw new Error("work() not registered");
  return handler as WorkHandler;
};

describe("createWorker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    handlerMock.mockReset();
  });

  it("starts pg-boss, creates every queue, and registers every handler", async () => {
    const worker = createWorker({ connectionString });
    await worker.start();

    expect(PgBossMock).toHaveBeenCalledWith(
      expect.objectContaining({ connectionString }),
    );
    expect(boss.on).toHaveBeenCalledWith("error", expect.any(Function));
    expect(boss.start).toHaveBeenCalledTimes(1);
    expect(boss.createQueue).toHaveBeenCalledWith(
      "send-support-email",
      QUEUE_POLICY,
    );
    expect(boss.work).toHaveBeenCalledTimes(1);
    expect(boss.work).toHaveBeenCalledWith(
      "send-support-email",
      expect.any(Function),
    );
  });

  it("runs the handler with each job's payload and reports completion", async () => {
    const onComplete = vi.fn();
    handlerMock.mockResolvedValue({ emailId: "e1" });

    await createWorker({ connectionString, onComplete }).start();
    await registeredHandler()([
      { id: "j1", name: "send-support-email", data: { type: "bug" } },
      { id: "j2", name: "send-support-email", data: { type: "feature" } },
    ]);

    expect(handlerMock).toHaveBeenCalledTimes(2);
    expect(handlerMock).toHaveBeenNthCalledWith(1, { type: "bug" });
    expect(handlerMock).toHaveBeenNthCalledWith(2, { type: "feature" });
    expect(onComplete).toHaveBeenCalledWith({
      job: "send-support-email",
      jobId: "j1",
    });
  });

  it("reports a failed job then rethrows so pg-boss retries it", async () => {
    const onError = vi.fn();
    const error = new Error("Resend is down");
    handlerMock.mockRejectedValue(error);

    await createWorker({ connectionString, onError }).start();

    await expect(
      registeredHandler()([{ id: "j1", name: "send-support-email", data: {} }]),
    ).rejects.toBe(error);

    expect(onError).toHaveBeenCalledWith(error, {
      job: "send-support-email",
      jobId: "j1",
    });
  });

  it("forwards pg-boss instance errors without a job ref", () => {
    const onError = vi.fn();
    createWorker({ connectionString, onError });

    const call = boss.on.mock.calls.find(([event]) => event === "error");
    const listener = call?.[1] as ((error: Error) => void) | undefined;
    const error = new Error("connection lost");
    listener?.(error);

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("stops gracefully", async () => {
    const worker = createWorker({ connectionString });
    await worker.stop();

    expect(boss.stop).toHaveBeenCalledWith({
      close: true,
      graceful: true,
      timeout: 30_000,
    });
  });
});
