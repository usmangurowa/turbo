import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  classifyFailure,
  compareEnvironment,
  DEFAULT_ENVIRONMENTS,
  describeFailure,
  EXIT,
  exitCodeFor,
  extractKeyNames,
  fetchKeyNames,
  loginMachineIdentity,
  parseArgs,
  redact,
  renderReport,
  resolveCredentials,
  toJson,
} from "../check-infisical-env.mjs";

const FAKE_VALUES = [
  "postgres://user:hunter2-pass@db.example.com:5432/turbo",
  "fake-api-key-0123456789abcdef0123456789abcdef",
  "multi word value with spaces",
  "eyJhbGciOiJIUzI1NiJ9.fakejwtpayload.signature",
];

const DOTENV = [
  `POSTGRES_URL=${FAKE_VALUES[0]}`,
  `AUTH_SECRET='${FAKE_VALUES[1]}'`,
  `SUPPORT_INBOX_EMAIL="${FAKE_VALUES[2]}"`,
  `export INFISICAL_TOKEN=${FAKE_VALUES[3]}`,
  "# a comment",
  "",
  "lowercase=ignored",
  "NEXT_PUBLIC_APP_URL=https://app.example.com",
].join("\n");

const assertNoValues = (text) => {
  for (const value of FAKE_VALUES) {
    assert.ok(!text.includes(value), `leaked value: ${value}`);
  }
  assert.ok(!text.includes("hunter2"), "leaked a password fragment");
};

/** A stub contract in the shape `loadEnvContract()` returns. */
const contract = () => {
  const groups = new Map([
    ["POSTGRES_URL", "Database"],
    ["AUTH_SECRET", "Better Auth"],
    ["GITHUB_CLIENT_ID", "Better Auth"],
    ["NEXT_PUBLIC_APP_URL", "App URLs"],
    ["RESEND_API_KEY", "Mail"],
  ]);
  const validated = new Map([
    ["POSTGRES_URL", { required: true, runtimes: new Set(["server", "web"]) }],
    [
      "AUTH_SECRET",
      { required: true, runtimes: new Set(["worker", "web", "server"]) },
    ],
    ["GITHUB_CLIENT_ID", { required: false, runtimes: new Set(["web"]) }],
    ["NEXT_PUBLIC_APP_URL", { required: false, runtimes: new Set(["web"]) }],
  ]);
  return {
    envExample: [...groups.keys()].sort(),
    groups,
    validated,
    passThroughEnv: ["PORT"],
    infisicalConfig: { workspaceId: "project-1", defaultEnvironment: "dev" },
  };
};

const spawnResult = (overrides) => ({
  status: 0,
  signal: null,
  error: undefined,
  stdout: "",
  stderr: "",
  ...overrides,
});

describe("extractKeyNames", () => {
  it("returns sorted unique key names and nothing else", () => {
    const keys = extractKeyNames(DOTENV);
    assert.deepEqual(keys, [
      "AUTH_SECRET",
      "INFISICAL_TOKEN",
      "NEXT_PUBLIC_APP_URL",
      "POSTGRES_URL",
      "SUPPORT_INBOX_EMAIL",
    ]);
    assertNoValues(JSON.stringify(keys));
  });

  it("ignores comments, blanks, and lowercase names", () => {
    assert.deepEqual(extractKeyNames("# X=1\n\nfoo=bar\n"), []);
  });
});

describe("redact", () => {
  it("masks name=value pairs, tokens, and long opaque strings", () => {
    const text = redact(
      `error: POSTGRES_URL=${FAKE_VALUES[0]} token ${FAKE_VALUES[3]} raw ${FAKE_VALUES[1]}`,
    );
    assertNoValues(text);
    assert.match(text, /POSTGRES_URL=\[redacted\]/);
  });

  it("prefers the Message: line over request metadata", () => {
    const text = redact(
      [
        "Request: GET https://app.infisical.com/api/v4/secrets?environment=nope",
        "Instance: https://app.infisical.com",
        "Request ID: req-1",
        "Response Code: 404 Not Found",
        "Message: Folder with path '/' in environment 'nope' was not found.",
      ].join("\n"),
    );
    assert.match(text, /^Message: Folder/);
    assert.ok(!text.includes("Request ID"));
  });
});

describe("compareEnvironment", () => {
  it("splits missing variables by requirement and keeps .env.example order", () => {
    const result = compareEnvironment(
      [
        "POSTGRES_URL",
        "NEXT_PUBLIC_APP_URL",
        "INFISICAL_CLIENT_ID",
        "PORT",
        "TYPO_KEY",
      ],
      contract(),
    );
    assert.equal(result.keyCount, 5);
    assert.deepEqual(result.missingRequired, [
      {
        name: "AUTH_SECRET",
        runtimes: ["web", "server", "worker"],
        group: "Better Auth",
      },
    ]);
    assert.deepEqual(
      result.missingOptional.map((item) => item.name),
      ["GITHUB_CLIENT_ID", "RESEND_API_KEY"],
    );
    assert.deepEqual(result.unknownKeys, ["TYPO_KEY"]);
    assert.deepEqual(result.publicKeys, ["NEXT_PUBLIC_APP_URL"]);
  });

  it("reports nothing missing when every contract variable is present", () => {
    const result = compareEnvironment(contract().envExample, contract());
    assert.deepEqual(result.missingRequired, []);
    assert.deepEqual(result.missingOptional, []);
    assert.deepEqual(result.unknownKeys, []);
  });

  it("falls back to envExample when the contract has no groups", () => {
    const stub = { ...contract(), groups: new Map() };
    const result = compareEnvironment([], stub);
    assert.deepEqual(
      result.missingRequired.map((item) => item.name),
      ["AUTH_SECRET", "POSTGRES_URL"],
    );
    assert.deepEqual(
      result.missingRequired.map((item) => item.group),
      ["", ""],
    );
  });

  it("treats a variable with no schema entry as optional", () => {
    const result = compareEnvironment([], contract());
    const resend = result.missingOptional.find(
      (item) => item.name === "RESEND_API_KEY",
    );
    assert.deepEqual(resend, {
      name: "RESEND_API_KEY",
      runtimes: [],
      group: "Mail",
    });
  });
});

describe("parseArgs", () => {
  it("defaults to the project default environment (null) with no flags", () => {
    const options = parseArgs([]);
    assert.equal(options.environments, null);
    assert.equal(options.strict, false);
    assert.equal(options.json, false);
    assert.deepEqual(options.errors, []);
  });

  it("accepts --env, --env=, --envs, and --all", () => {
    assert.deepEqual(parseArgs(["--env", "prod"]).environments, ["prod"]);
    assert.deepEqual(parseArgs(["--env=staging"]).environments, ["staging"]);
    assert.deepEqual(parseArgs(["--envs", "dev, prod,,"]).environments, [
      "dev",
      "prod",
    ]);
    assert.deepEqual(parseArgs(["--all"]).environments, DEFAULT_ENVIRONMENTS);
    assert.deepEqual(parseArgs(["--all", "--envs", "a,b"]).environments, [
      "a",
      "b",
    ]);
  });

  it("collects errors for unknown flags, missing values, and bad slugs", () => {
    assert.deepEqual(parseArgs(["--bogus"]).errors, ["unknown option --bogus"]);
    assert.deepEqual(parseArgs(["--env"]).errors, ["--env needs a value"]);
    assert.deepEqual(parseArgs(["--env", "--strict"]).errors, [
      "--env needs a value",
    ]);
    assert.deepEqual(parseArgs(["--env", "pro d"]).errors, [
      'invalid environment slug "pro d"',
    ]);
  });

  it("sets strict, json, and help", () => {
    const options = parseArgs(["--strict", "--json", "--help"]);
    assert.equal(options.strict, true);
    assert.equal(options.json, true);
    assert.equal(options.help, true);
  });
});

describe("resolveCredentials", () => {
  it("follows the infisical-run.sh order", () => {
    assert.equal(
      resolveCredentials({
        INFISICAL_CLIENT_ID: "id",
        INFISICAL_CLIENT_SECRET: "s",
      }).method,
      "machine-identity",
    );
    assert.equal(resolveCredentials({ INFISICAL_TOKEN: "t" }).method, "token");
    assert.equal(resolveCredentials({}).method, "login-session");
  });

  it("refuses half-configured machine identity and credential-less CI", () => {
    const half = resolveCredentials({ INFISICAL_CLIENT_ID: "id" });
    assert.equal(half.method, "none");
    assert.match(half.reason, /half-configured/);
    const ci = resolveCredentials({ CI: "true" });
    assert.equal(ci.method, "none");
    assert.match(ci.reason, /CI/);
    assert.equal(
      resolveCredentials({ CI: "true", INFISICAL_TOKEN: "t" }).method,
      "token",
    );
  });
});

describe("classifyFailure", () => {
  it("maps CLI outcomes to reasons", () => {
    assert.equal(
      classifyFailure(
        spawnResult({
          error: { code: "ENOENT", path: "infisical" },
          status: null,
        }),
      ).reason,
      "cli-missing",
    );
    assert.equal(
      classifyFailure(spawnResult({ signal: "SIGTERM", status: null })).reason,
      "timeout",
    );
    assert.equal(
      classifyFailure(
        spawnResult({
          status: 1,
          stderr: "INF No valid login session found, triggering login flow",
          stdout: "? Select your hosting option:",
        }),
      ).reason,
      "no-session",
    );
    assert.equal(
      classifyFailure(
        spawnResult({
          status: 1,
          stderr:
            "Message: Folder with path '/' in environment 'x' was not found.",
        }),
      ).reason,
      "unknown-environment",
    );
    assert.equal(
      classifyFailure(
        spawnResult({
          status: 1,
          stderr:
            'error: unable to get service token details. [err=Get "http://127.0.0.1:9": dial tcp 127.0.0.1:9: connect: connection refused]',
        }),
      ).reason,
      "unreachable",
    );
    assert.equal(
      classifyFailure(
        spawnResult({
          status: 1,
          stderr: "error: invalid service token entered.",
        }),
      ).reason,
      "auth",
    );
    assert.equal(
      classifyFailure(spawnResult({ status: 3, stderr: "something else" }))
        .reason,
      "cli-error",
    );
  });

  it("never carries secrets in the detail", () => {
    const failure = classifyFailure(
      spawnResult({
        status: 1,
        stderr: `error: bad AUTH_SECRET=${FAKE_VALUES[1]}`,
        stdout: DOTENV,
      }),
    );
    assertNoValues(failure.detail);
  });
});

describe("fetchKeyNames", () => {
  it("passes flags that keep the CLI non-interactive and returns names only", () => {
    let seen;
    const spawn = (bin, args, options) => {
      seen = { bin, args, options };
      return spawnResult({ stdout: DOTENV });
    };
    const result = fetchKeyNames({
      bin: "infisical",
      projectId: "project-1",
      environment: "prod",
      token: "secret-token",
      spawn,
    });
    assert.equal(result.ok, true);
    assert.deepEqual(result.keys, extractKeyNames(DOTENV));
    assert.deepEqual(seen.args, [
      "export",
      "--env",
      "prod",
      "--format=dotenv",
      "--silent",
      "--projectId",
      "project-1",
      "--token",
      "secret-token",
    ]);
    assert.equal(seen.options.stdio[0], "ignore");
    assert.ok(seen.options.timeout > 0);
    assertNoValues(JSON.stringify(result));
  });

  it("omits --token for a login session and surfaces classified failures", () => {
    let seen;
    const spawn = (bin, args) => {
      seen = args;
      return spawnResult({
        status: 1,
        stderr: "No valid login session found",
      });
    };
    const result = fetchKeyNames({
      bin: "infisical",
      projectId: "p",
      environment: "dev",
      spawn,
    });
    assert.ok(!seen.includes("--token"));
    assert.equal(result.ok, false);
    assert.equal(result.failure.reason, "no-session");
  });
});

describe("loginMachineIdentity", () => {
  it("returns the token from stdout and fails on an empty response", () => {
    const ok = loginMachineIdentity({
      bin: "infisical",
      clientId: "id",
      clientSecret: "s",
      spawn: () => spawnResult({ stdout: "tok\n" }),
    });
    assert.deepEqual(ok, { ok: true, token: "tok" });
    const empty = loginMachineIdentity({
      bin: "infisical",
      clientId: "id",
      clientSecret: "s",
      spawn: () => spawnResult({ stdout: "" }),
    });
    assert.equal(empty.ok, false);
    assert.equal(empty.failure.reason, "auth");
  });
});

describe("exitCodeFor", () => {
  const drift = {
    environment: "dev",
    ok: true,
    comparison: { missingRequired: [{ name: "X" }] },
  };
  const clean = {
    environment: "prod",
    ok: true,
    comparison: { missingRequired: [] },
  };
  const down = {
    environment: "staging",
    ok: false,
    failure: { reason: "unreachable" },
  };

  it("is 0 in report mode whatever happened", () => {
    assert.equal(
      exitCodeFor({ results: [drift, down], strict: false }),
      EXIT.OK,
    );
  });

  it("is 1 for drift, 2 for unavailable, 0 when clean in strict mode", () => {
    assert.equal(
      exitCodeFor({ results: [clean, drift], strict: true }),
      EXIT.DRIFT,
    );
    assert.equal(
      exitCodeFor({ results: [clean, down], strict: true }),
      EXIT.UNAVAILABLE,
    );
    assert.equal(
      exitCodeFor({ results: [drift, down], strict: true }),
      EXIT.DRIFT,
    );
    assert.equal(exitCodeFor({ results: [clean], strict: true }), EXIT.OK);
  });
});

describe("renderReport and toJson", () => {
  const context = {
    bin: "infisical",
    projectId: "project-1",
    projectSource: ".infisical.json",
    credentialMethod: "login-session",
  };
  const results = [
    {
      environment: "prod",
      ok: true,
      comparison: compareEnvironment(
        ["POSTGRES_URL", "AUTH_SECRET", "NEXT_PUBLIC_APP_URL"],
        contract(),
      ),
    },
    {
      environment: "dev",
      ok: true,
      comparison: compareEnvironment([], contract()),
    },
    {
      environment: "nope",
      ok: false,
      failure: { reason: "unknown-environment", detail: "Message: not found" },
    },
  ];

  it("prints a summary table, grouped sections, and failure hints", () => {
    const text = renderReport({ context, results });
    assert.match(text, /\| prod \| 3 \| 0 \| 2 \| 0 \|/);
    assert.match(text, /\| dev \| 0 \| 2 \| 3 \| 0 \|/);
    assert.match(
      text,
      /\| nope \| — \| — \| — \| unavailable \(unknown-environment\) \|/,
    );
    assert.match(text, /- \*\*Database\*\* — `POSTGRES_URL` \(web, server\)/);
    assert.match(
      text,
      /- \*\*Better Auth\*\* — `AUTH_SECRET` \(web, server, worker\)/,
    );
    assert.match(text, /### Public keys present[\s\S]*- `NEXT_PUBLIC_APP_URL`/);
    assert.match(
      text,
      /## nope — unavailable\n\nEnvironment `nope` does not exist in project `project-1`/,
    );
  });

  it("emits a machine-readable object with the same content", () => {
    const json = toJson({ context, results, exitCode: EXIT.DRIFT });
    assert.equal(json.exitCode, 1);
    assert.equal(json.project.id, "project-1");
    assert.equal(json.environments[0].keyCount, 3);
    assert.deepEqual(
      json.environments[1].missingRequired.map((item) => item.name),
      ["POSTGRES_URL", "AUTH_SECRET"],
    );
    assert.equal(json.environments[2].ok, false);
    assert.equal(json.environments[2].failure.reason, "unknown-environment");
  });

  it("describes a credential-less run without a dangling hint", () => {
    assert.equal(
      describeFailure(
        { reason: "no-credentials", detail: "no creds in CI" },
        context,
        "prod",
      ),
      "no creds in CI",
    );
  });
});
