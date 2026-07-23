import { describe, expect, it } from "vitest";

import type { AuthWithApi, Db } from "../context";
import { createApp } from "../index";

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

// The empty stub has no select/insert: any query throws, which is how the
// zero-env template behaves when POSTGRES_URL is missing.
const stubDb = {} as Db;

// A real insert test would need a live Postgres database — the repo has no
// test database, so the live-DB path is intentionally not covered here.

describe("GET /tasks", () => {
  it("returns an empty list when the database is unavailable", async () => {
    const app = createApp(unauthedStub, stubDb);
    const res = await app.request("/tasks");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ tasks: [] });
  });
});

describe("POST /tasks", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const app = createApp(unauthedStub, stubDb);
    const res = await app.request("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Ship the tracer bullet" }),
    });
    expect(res.status).toBe(401);
  });

  it("rejects an empty title with 400", async () => {
    const app = createApp(authedStub, stubDb);
    const res = await app.request("/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "" }),
    });
    expect(res.status).toBe(400);
  });
});
