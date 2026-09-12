import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isPublicVariable, loadEnvContract, sortRuntimes } from "./_env.mjs";
import { formatTable, fromRoot } from "./_lib.mjs";

/**
 * Compare a live Infisical environment against the repo's env contract.
 *
 * Only key *names* leave the CLI buffer: the dotenv export is parsed for
 * `^KEY=` and discarded. Nothing is written to disk and error output is
 * redacted before it is printed.
 *
 * Exit codes (`--strict` only; report mode always exits 0 unless usage error):
 *   0  no environment is missing a required variable
 *   1  at least one environment is missing a required variable
 *   2  Infisical could not be read (CLI missing, no credentials, unreachable,
 *      unknown environment slug) — distinct so CI without credentials can skip
 *   64 usage error
 */

export const EXIT = { OK: 0, DRIFT: 1, UNAVAILABLE: 2, USAGE: 64 };

/** The CLI cannot list environments; these are the project's current slugs. */
export const DEFAULT_ENVIRONMENTS = ["dev", "staging", "prod"];

export const SPAWN_TIMEOUT_MS = 30_000;

const USAGE = `Usage: node scripts/ai/check-infisical-env.mjs [options]

  --env <slug>      Environment to check (default: defaultEnvironment in .infisical.json)
  --envs <a,b,c>    Comma-separated environments to check
  --all             Check every environment (default list: ${DEFAULT_ENVIRONMENTS.join(", ")}; override with --envs)
  --strict          Exit 1 on missing required variables, 2 when Infisical is unavailable
  --json            Print a machine-readable object instead of the report
  --help            Show this help

Credentials, in order: INFISICAL_CLIENT_ID + INFISICAL_CLIENT_SECRET (machine
identity), INFISICAL_TOKEN, then a local \`infisical login\` session (never in CI).`;

export const parseArgs = (argv) => {
  const options = {
    environments: null,
    all: false,
    strict: false,
    json: false,
    help: false,
    errors: [],
  };
  const explicit = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const [flag, inlineValue] = arg.includes("=")
      ? [arg.slice(0, arg.indexOf("=")), arg.slice(arg.indexOf("=") + 1)]
      : [arg, undefined];
    const takeValue = () => {
      if (inlineValue !== undefined) return inlineValue;
      const next = argv[index + 1];
      if (next === undefined || next.startsWith("--")) {
        options.errors.push(`${flag} needs a value`);
        return undefined;
      }
      index += 1;
      return next;
    };

    switch (flag) {
      case "--env": {
        const value = takeValue();
        if (value) explicit.push(value);
        break;
      }
      case "--envs": {
        const value = takeValue();
        if (value) {
          explicit.push(
            ...value
              .split(",")
              .map((slug) => slug.trim())
              .filter(Boolean),
          );
        }
        break;
      }
      case "--all":
        options.all = true;
        break;
      case "--strict":
        options.strict = true;
        break;
      case "--json":
        options.json = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        options.errors.push(`unknown option ${arg}`);
    }
  }

  const invalid = explicit.filter(
    (slug) => !/^[a-z0-9][a-z0-9-]*$/i.test(slug),
  );
  for (const slug of invalid) {
    options.errors.push(`invalid environment slug "${slug}"`);
  }

  if (explicit.length > 0) {
    options.environments = [...new Set(explicit)];
  } else if (options.all) {
    options.environments = [...DEFAULT_ENVIRONMENTS];
  }

  return options;
};

/** Key names from dotenv text. Values never leave this function. */
export const extractKeyNames = (dotenvText) => {
  const names = new Set();
  for (const line of String(dotenvText).split("\n")) {
    const name = line.match(/^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)=/)?.[1];
    if (name) names.add(name);
  }
  return [...names].sort();
};

/**
 * Strip anything that could be a secret from CLI output before it is shown:
 * `name=value` pairs, service/access tokens, and long opaque strings.
 */
export const redact = (text) => {
  const lines = String(text ?? "")
    .replace(/([A-Za-z_][A-Za-z0-9_-]*)=[^\s\]]*/g, "$1=[redacted]")
    .replace(/\b(st|eyJ)[A-Za-z0-9._-]{8,}/g, "[redacted]")
    .replace(/[A-Za-z0-9+/_-]{32,}/g, "[redacted]")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  // The CLI's `Message:` line (or an `error:` line) says what went wrong;
  // the request/instance/request-id lines around it do not.
  const telling = lines.filter((line) => /^Message:|error/i.test(line));
  return (telling.length > 0 ? telling : lines)
    .slice(0, 2)
    .join(" | ")
    .slice(0, 240);
};

/**
 * Turn a failed spawn into a reason the report can act on. Patterns are
 * checked most-specific first: a network error from the token path also says
 * "unable to get service token details", so connectivity wins over auth.
 */
export const classifyFailure = ({ status, signal, error, stderr, stdout }) => {
  const output = `${stderr ?? ""}\n${stdout ?? ""}`;
  const detail = redact(stderr || stdout);

  if (error?.code === "ENOENT") {
    return { reason: "cli-missing", detail: error.path ?? detail };
  }
  if (error?.code === "ETIMEDOUT" || signal) {
    return { reason: "timeout", detail };
  }
  if (/No valid login session|login flow|infisical login\]/i.test(output)) {
    return { reason: "no-session", detail };
  }
  if (/was not found|404 Not Found|environment slug/i.test(output)) {
    return { reason: "unknown-environment", detail };
  }
  if (
    /dial tcp|connection refused|no such host|i\/o timeout|unexpected EOF|TLS handshake|network is unreachable|context deadline/i.test(
      output,
    )
  ) {
    return { reason: "unreachable", detail };
  }
  if (
    /unable to get service token|invalid service token|unauthorized|401|403|invalid token|token is invalid|expired/i.test(
      output,
    )
  ) {
    return { reason: "auth", detail };
  }
  return { reason: "cli-error", detail: `exit ${status ?? "?"}: ${detail}` };
};

const CREDENTIAL_LABELS = {
  "machine-identity":
    "INFISICAL_CLIENT_ID + INFISICAL_CLIENT_SECRET (machine identity)",
  token: "INFISICAL_TOKEN",
  "login-session": "local `infisical login` session",
  none: "none",
};

/**
 * Same order as scripts/infisical-run.sh. The returned object may hold
 * secrets; only `method` and `reason` are ever printed.
 */
export const resolveCredentials = (env = process.env) => {
  const clientId = env.INFISICAL_CLIENT_ID;
  const clientSecret = env.INFISICAL_CLIENT_SECRET;

  if (clientId && clientSecret) {
    return { method: "machine-identity", clientId, clientSecret };
  }
  if (clientId || clientSecret) {
    return {
      method: "none",
      reason:
        "machine identity is half-configured: set both INFISICAL_CLIENT_ID and INFISICAL_CLIENT_SECRET",
    };
  }
  if (env.INFISICAL_TOKEN) {
    return { method: "token", token: env.INFISICAL_TOKEN };
  }
  if (env.CI || env.VERCEL) {
    return {
      method: "none",
      reason:
        "no Infisical credentials in CI: set INFISICAL_CLIENT_ID + INFISICAL_CLIENT_SECRET or INFISICAL_TOKEN",
    };
  }
  return { method: "login-session" };
};

export const resolveCli = () => {
  const pinned = fromRoot("node_modules", ".bin", "infisical");
  return existsSync(pinned) ? pinned : "infisical";
};

const displayCli = (bin) =>
  path.isAbsolute(bin) ? path.relative(fromRoot(), bin) || bin : bin;

const spawnCli = (bin, args, spawn) =>
  spawn(bin, args, {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
    timeout: SPAWN_TIMEOUT_MS,
    env: { ...process.env, INFISICAL_DISABLE_UPDATE_CHECK: "true" },
  });

/** Exchange a machine identity for an access token, kept in memory only. */
export const loginMachineIdentity = ({
  bin,
  clientId,
  clientSecret,
  spawn = spawnSync,
}) => {
  const result = spawnCli(
    bin,
    [
      "login",
      "--method=universal-auth",
      `--client-id=${clientId}`,
      `--client-secret=${clientSecret}`,
      "--silent",
      "--plain",
    ],
    spawn,
  );
  if (result.error || result.status !== 0) {
    return { ok: false, failure: classifyFailure(result) };
  }
  const token = String(result.stdout).trim();
  if (!token) {
    return {
      ok: false,
      failure: { reason: "auth", detail: "login returned no token" },
    };
  }
  return { ok: true, token };
};

/** Key names of one environment. The value buffer is dropped on return. */
export const fetchKeyNames = ({
  bin,
  projectId,
  environment,
  token,
  spawn = spawnSync,
}) => {
  const args = ["export", "--env", environment, "--format=dotenv", "--silent"];
  if (projectId) args.push("--projectId", projectId);
  if (token) args.push("--token", token);

  const result = spawnCli(bin, args, spawn);
  if (result.error || result.status !== 0) {
    return { ok: false, failure: classifyFailure(result) };
  }
  return { ok: true, keys: extractKeyNames(result.stdout) };
};

/**
 * Compare an environment's key names with the contract.
 * `contract` needs `envExample`, `validated`, and optionally `groups` (for
 * .env.example order and headings) and `passThroughEnv`.
 */
export const compareEnvironment = (keys, contract) => {
  const present = new Set(keys);
  const names =
    contract.groups?.size > 0
      ? [...contract.groups.keys()]
      : [...contract.envExample];
  const missingRequired = [];
  const missingOptional = [];

  for (const name of names) {
    if (present.has(name)) continue;
    const entry = contract.validated?.get(name);
    const item = {
      name,
      runtimes: entry ? sortRuntimes(entry.runtimes) : [],
      group: contract.groups?.get(name) ?? "",
    };
    (entry?.required ? missingRequired : missingOptional).push(item);
  }

  const known = new Set([
    ...contract.envExample,
    ...(contract.passThroughEnv ?? []),
  ]);
  const unknownKeys = [...present]
    .filter((name) => !known.has(name) && !name.startsWith("INFISICAL_"))
    .sort();
  const publicKeys = [...present].filter(isPublicVariable).sort();

  return {
    keyCount: present.size,
    missingRequired,
    missingOptional,
    unknownKeys,
    publicKeys,
  };
};

export const exitCodeFor = ({ results, strict }) => {
  if (!strict) return EXIT.OK;
  if (
    results.some(
      (result) => result.ok && result.comparison.missingRequired.length > 0,
    )
  ) {
    return EXIT.DRIFT;
  }
  if (results.some((result) => !result.ok)) return EXIT.UNAVAILABLE;
  return EXIT.OK;
};

const FAILURE_HINTS = {
  "cli-missing": (context) =>
    `Infisical CLI not found (${displayCli(context.bin)}). Run \`pnpm install\` (it ships as @infisical/cli) or install it on PATH.`,
  "no-session": () =>
    "No `infisical login` session. Run `pnpm exec infisical login`, or set INFISICAL_CLIENT_ID + INFISICAL_CLIENT_SECRET (machine identity) or INFISICAL_TOKEN.",
  "no-credentials": () => "",
  timeout: () =>
    `Infisical did not answer within ${SPAWN_TIMEOUT_MS / 1000}s. Check the network or INFISICAL_API_URL.`,
  unreachable: () =>
    "Could not reach Infisical. Check the network or INFISICAL_API_URL.",
  "unknown-environment": (context, environment) =>
    `Environment \`${environment}\` does not exist in project \`${context.projectId}\`. Pass --envs with the project's environment slugs.`,
  auth: (context) =>
    `Infisical rejected the credentials (${CREDENTIAL_LABELS[context.credentialMethod]}).`,
  "cli-error": () => "infisical export failed.",
};

export const describeFailure = (failure, context, environment) => {
  const hint = FAILURE_HINTS[failure.reason]?.(context, environment) ?? "";
  if (!failure.detail) return hint;
  return hint ? `${hint} (${failure.detail})` : failure.detail;
};

const groupedList = (items, withRuntimes) => {
  if (items.length === 0) return "- None";
  const byGroup = new Map();
  for (const item of items) {
    const heading = item.group || "Ungrouped";
    (byGroup.get(heading) ?? byGroup.set(heading, []).get(heading)).push(item);
  }
  return [...byGroup.entries()]
    .map(([heading, groupItems]) => {
      const names = groupItems
        .map((item) =>
          withRuntimes && item.runtimes.length > 0
            ? `\`${item.name}\` (${item.runtimes.join(", ")})`
            : `\`${item.name}\``,
        )
        .join(", ");
      return `- **${heading}** — ${names}`;
    })
    .join("\n");
};

const inlineList = (names) =>
  names.length === 0
    ? "- None"
    : `- ${names.map((n) => `\`${n}\``).join(", ")}`;

export const renderReport = ({ context, results }) => {
  const rows = results.map((result) =>
    result.ok
      ? [
          result.environment,
          String(result.comparison.keyCount),
          String(result.comparison.missingRequired.length),
          String(result.comparison.missingOptional.length),
          String(result.comparison.unknownKeys.length),
        ]
      : [
          result.environment,
          "—",
          "—",
          "—",
          `unavailable (${result.failure.reason})`,
        ],
  );

  const sections = results.map((result) => {
    if (!result.ok) {
      return [
        `## ${result.environment} — unavailable`,
        "",
        describeFailure(result.failure, context, result.environment),
      ].join("\n");
    }
    const { comparison } = result;
    return [
      `## ${result.environment} — ${comparison.keyCount} key${comparison.keyCount === 1 ? "" : "s"}`,
      "",
      "### Missing required (fails --strict)",
      "",
      groupedList(comparison.missingRequired, true),
      "",
      "### Missing optional (feature off)",
      "",
      groupedList(comparison.missingOptional, false),
      "",
      "### Unknown keys (not in .env.example)",
      "",
      inlineList(comparison.unknownKeys),
      "",
      "### Public keys present (build-time, not secret)",
      "",
      inlineList(comparison.publicKeys),
    ].join("\n");
  });

  return [
    "# Infisical environment drift",
    "",
    `Project \`${context.projectId ?? "unknown"}\` (from \`${context.projectSource}\`), CLI \`${displayCli(context.bin)}\`, credentials: ${CREDENTIAL_LABELS[context.credentialMethod]}.`,
    "",
    formatTable(
      [
        "Environment",
        "Keys",
        "Missing required",
        "Missing optional",
        "Unknown keys",
      ],
      rows,
    ),
    "",
    ...sections.flatMap((section) => [section, ""]),
  ]
    .join("\n")
    .trimEnd();
};

export const toJson = ({ context, results, exitCode }) => ({
  project: {
    id: context.projectId ?? null,
    source: context.projectSource,
    cli: displayCli(context.bin),
    credentials: context.credentialMethod,
  },
  environments: results.map((result) =>
    result.ok
      ? { environment: result.environment, ok: true, ...result.comparison }
      : {
          environment: result.environment,
          ok: false,
          failure: {
            ...result.failure,
            hint: describeFailure(result.failure, context, result.environment),
          },
        },
  ),
  exitCode,
});

export const main = async (argv = process.argv.slice(2)) => {
  const options = parseArgs(argv);

  if (options.help) {
    console.log(USAGE);
    return EXIT.OK;
  }
  if (options.errors.length > 0) {
    console.error(options.errors.map((error) => `error: ${error}`).join("\n"));
    console.error("");
    console.error(USAGE);
    return EXIT.USAGE;
  }

  const contract = await loadEnvContract();
  const projectId =
    process.env.INFISICAL_PROJECT_ID ?? contract.infisicalConfig?.workspaceId;
  const projectSource = process.env.INFISICAL_PROJECT_ID
    ? "INFISICAL_PROJECT_ID"
    : ".infisical.json";
  const environments = options.environments ?? [
    contract.infisicalConfig?.defaultEnvironment ?? "dev",
  ];
  const bin = resolveCli();
  const credentials = resolveCredentials();
  const context = {
    bin,
    projectId,
    projectSource,
    credentialMethod: credentials.method,
  };

  const unavailable = (failure) =>
    environments.map((environment) => ({ environment, ok: false, failure }));

  let results;
  if (!projectId) {
    results = unavailable({
      reason: "cli-error",
      detail:
        "no project id: set INFISICAL_PROJECT_ID or commit .infisical.json (pnpm exec infisical init)",
    });
  } else if (credentials.method === "none") {
    results = unavailable({
      reason: "no-credentials",
      detail: credentials.reason,
    });
  } else {
    let token = credentials.token;
    let loginFailure = null;
    if (credentials.method === "machine-identity") {
      const login = loginMachineIdentity({ bin, ...credentials });
      if (login.ok) token = login.token;
      else loginFailure = login.failure;
    }
    results = loginFailure
      ? unavailable(loginFailure)
      : environments.map((environment) => {
          const fetched = fetchKeyNames({ bin, projectId, environment, token });
          return fetched.ok
            ? {
                environment,
                ok: true,
                comparison: compareEnvironment(fetched.keys, contract),
              }
            : { environment, ok: false, failure: fetched.failure };
        });
  }

  const exitCode = exitCodeFor({ results, strict: options.strict });

  if (options.json) {
    console.log(
      JSON.stringify(toJson({ context, results, exitCode }), null, 2),
    );
  } else {
    console.log(renderReport({ context, results }));
    const failed = results.filter((result) => !result.ok);
    if (failed.length > 0) {
      console.error("");
      const via =
        credentials.method === "none"
          ? ""
          : ` via ${CREDENTIAL_LABELS[credentials.method]}`;
      console.error(
        `Infisical unavailable${via}: ${describeFailure(failed[0].failure, context, failed[0].environment)}`,
      );
    }
    if (exitCode === EXIT.DRIFT) {
      console.error("");
      console.error(
        "Missing required variables. Add them in Infisical before deploying.",
      );
    }
  }

  return exitCode;
};

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  process.exitCode = await main();
}
