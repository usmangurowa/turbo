import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AuthWithApi, Db } from "../context";
import { createApp } from "../index";

const user = { id: "u1", email: "u@example.com", name: "U" };

const fakeKeys = [
  {
    id: "key_1",
    name: "CI deploys",
    start: "turbo_abc",
    prefix: "turbo",
    key: "hashed-secret-1",
    enabled: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    expiresAt: null,
    lastRequest: null,
  },
  {
    id: "key_2",
    name: "Local scripts",
    start: "turbo_def",
    prefix: "turbo",
    key: "hashed-secret-2",
    enabled: false,
    createdAt: new Date("2026-02-01T00:00:00Z"),
    expiresAt: null,
    lastRequest: null,
  },
];

const listApiKeysMock = vi.fn();
const createApiKeyMock = vi.fn();
const deleteApiKeyMock = vi.fn();

const authedStub = {
  api: {
    getSession: () => Promise.resolve({ user, session: {} }),
    listApiKeys: listApiKeysMock,
    createApiKey: createApiKeyMock,
    deleteApiKey: deleteApiKeyMock,
  },
} as unknown as AuthWithApi;

const unauthedStub = {
  api: {
    getSession: () => Promise.resolve(null),
    listApiKeys: listApiKeysMock,
    createApiKey: createApiKeyMock,
    deleteApiKey: deleteApiKeyMock,
  },
} as unknown as AuthWithApi;

const stubDb = {} as Db;

describe("apikeys router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listApiKeysMock.mockResolvedValue({ apiKeys: fakeKeys, total: 2 });
    createApiKeyMock.mockImplementation(
      ({ body }: { body: { name: string } }) =>
        Promise.resolve({
          ...fakeKeys[0],
          name: body.name,
          key: "turbo_plaintext_once",
        }),
    );
    deleteApiKeyMock.mockResolvedValue({ success: true });
  });

  describe("unauthenticated requests", () => {
    it("rejects GET /apikeys with 401", async () => {
      const app = createApp(unauthedStub, stubDb);
      const res = await app.request("/apikeys");
      expect(res.status).toBe(401);
      expect(listApiKeysMock).not.toHaveBeenCalled();
    });

    it("rejects POST /apikeys with 401", async () => {
      const app = createApp(unauthedStub, stubDb);
      const res = await app.request("/apikeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "CI deploys" }),
      });
      expect(res.status).toBe(401);
      expect(createApiKeyMock).not.toHaveBeenCalled();
    });

    it("rejects DELETE /apikeys/:id with 401", async () => {
      const app = createApp(unauthedStub, stubDb);
      const res = await app.request("/apikeys/key_1", { method: "DELETE" });
      expect(res.status).toBe(401);
      expect(deleteApiKeyMock).not.toHaveBeenCalled();
    });
  });

  describe("GET /apikeys", () => {
    it("lists the user's keys without leaking the key hash", async () => {
      const app = createApp(authedStub, stubDb);
      const res = await app.request("/apikeys");

      expect(res.status).toBe(200);
      const body = (await res.json()) as { apiKeys: { id: string }[] };
      expect(body.apiKeys.map((apiKey) => apiKey.id)).toEqual([
        "key_1",
        "key_2",
      ]);
      // The hashed `key` column must never leave the server on list.
      expect(JSON.stringify(body)).not.toContain('"key":');
    });
  });

  describe("POST /apikeys", () => {
    it("rejects an empty name with 400", async () => {
      const app = createApp(authedStub, stubDb);
      const res = await app.request("/apikeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" }),
      });
      expect(res.status).toBe(400);
      expect(createApiKeyMock).not.toHaveBeenCalled();
    });

    it("creates a key via the plugin and returns 201", async () => {
      const app = createApp(authedStub, stubDb);
      const res = await app.request("/apikeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "CI deploys" }),
      });

      expect(res.status).toBe(201);
      expect(createApiKeyMock).toHaveBeenCalledTimes(1);
      expect(createApiKeyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { name: "CI deploys", expiresIn: undefined },
        }),
      );
      const body = (await res.json()) as { apiKey: { name: string } };
      expect(body.apiKey.name).toBe("CI deploys");
    });
  });

  describe("DELETE /apikeys/:id", () => {
    it("revokes the key identified by the path param", async () => {
      const app = createApp(authedStub, stubDb);
      const res = await app.request("/apikeys/key_2", { method: "DELETE" });

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
      expect(deleteApiKeyMock).toHaveBeenCalledTimes(1);
      expect(deleteApiKeyMock).toHaveBeenCalledWith(
        expect.objectContaining({ body: { keyId: "key_2" } }),
      );
    });

    it("maps a plugin not-found error to 404", async () => {
      const notFound = Object.assign(new Error("API Key not found"), {
        statusCode: 404,
        body: { message: "API Key not found" },
      });
      deleteApiKeyMock.mockRejectedValueOnce(notFound);

      const app = createApp(authedStub, stubDb);
      const res = await app.request("/apikeys/missing", { method: "DELETE" });

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ error: "API Key not found" });
    });
  });
});
