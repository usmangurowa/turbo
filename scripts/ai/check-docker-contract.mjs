import { readJson, readText } from "./_lib.mjs";

const DOCKERFILES = ["apps/web/Dockerfile", "apps/server/Dockerfile"];
const ENV_FILE = "apps/web/src/env.ts";

const findLine = (lines, regex) => {
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(regex);
    if (match) return { line: index + 1, value: match[1] };
  }
  return null;
};

const extractClientKeys = (lines) => {
  const startIndex = lines.findIndex((line) => /^\s*client:\s*\{/.test(line));
  if (startIndex === -1) return null;

  const keys = [];
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^\s*\},?\s*$/.test(line)) break;
    const match = line.match(/^\s*(NEXT_PUBLIC_[A-Z0-9_]+):/);
    if (match) keys.push(match[1]);
  }
  return keys;
};

const checkPin = (
  findings,
  dockerfile,
  lines,
  name,
  expected,
  expectedDisplay,
) => {
  const pin = findLine(lines, new RegExp(`^ARG ${name}=(.+)$`));
  if (!pin) {
    findings.push({
      file: dockerfile,
      line: 1,
      rule: "pin-missing",
      message: `no ARG ${name}=<value> line found`,
    });
  } else if (expected !== undefined && pin.value !== expected) {
    findings.push({
      file: dockerfile,
      line: pin.line,
      rule: "pin-mismatch",
      message: `${name}=${pin.value} but ${expectedDisplay}`,
    });
  }
};

const main = async () => {
  const findings = [];

  const nvmrc = (await readText(".nvmrc")).trim();
  const rootManifest = await readJson("package.json");
  const packageManager = rootManifest.packageManager ?? "";
  const pnpmMatch = packageManager.match(/^pnpm@(.+)$/);

  if (!pnpmMatch) {
    findings.push({
      file: "package.json",
      line: 1,
      rule: "package-manager-missing",
      message: `packageManager is ${JSON.stringify(packageManager)}, expected "pnpm@<version>"`,
    });
  }
  const expectedPnpm = pnpmMatch?.[1];

  let lastNextPublicLine = 1;

  for (const dockerfile of DOCKERFILES) {
    const text = await readText(dockerfile);
    const lines = text.split("\n");

    checkPin(
      findings,
      dockerfile,
      lines,
      "NODE_VERSION",
      nvmrc,
      `.nvmrc is ${nvmrc}`,
    );
    checkPin(
      findings,
      dockerfile,
      lines,
      "PNPM_VERSION",
      expectedPnpm,
      `package.json#packageManager is pnpm@${expectedPnpm}`,
    );

    if (dockerfile === "apps/web/Dockerfile") {
      const declaredArgs = [];
      lines.forEach((line, index) => {
        const match = line.match(/^ARG (NEXT_PUBLIC_[A-Z0-9_]+)/);
        if (match) {
          declaredArgs.push({ name: match[1], line: index + 1 });
          lastNextPublicLine = index + 1;
        }
      });

      const envText = await readText(ENV_FILE);
      const envLines = envText.split("\n");
      const expectedArgs = extractClientKeys(envLines);

      if (expectedArgs === null) {
        findings.push({
          file: ENV_FILE,
          line: 1,
          rule: "env-client-block-missing",
          message: "no `client: {` block found in apps/web/src/env.ts",
        });
      } else {
        const declaredNames = new Set(declaredArgs.map((arg) => arg.name));
        const expectedNames = new Set(expectedArgs);

        for (const key of expectedArgs) {
          if (!declaredNames.has(key)) {
            findings.push({
              file: dockerfile,
              line: lastNextPublicLine,
              rule: "build-arg-missing",
              message: `apps/web/src/env.ts declares ${key} but apps/web/Dockerfile has no ARG for it`,
            });
          }
        }
        for (const arg of declaredArgs) {
          if (!expectedNames.has(arg.name)) {
            findings.push({
              file: dockerfile,
              line: arg.line,
              rule: "build-arg-extra",
              message: `apps/web/Dockerfile declares ARG ${arg.name} but apps/web/src/env.ts has no matching client key`,
            });
          }
        }
      }
    }
  }

  findings.sort(
    (left, right) =>
      left.file.localeCompare(right.file) || left.line - right.line,
  );

  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(
        `${finding.file}:${finding.line}: error ${finding.rule} ${finding.message}`,
      );
    }
    console.error(
      `Docker contract check failed with ${findings.length} error(s).`,
    );
    process.exitCode = 1;
    return;
  }

  const envText = await readText(ENV_FILE);
  const buildArgCount = (extractClientKeys(envText.split("\n")) ?? []).length;
  console.log(
    `Docker contract matches .nvmrc, packageManager, and apps/web/src/env.ts (${buildArgCount} build args).`,
  );
};

await main();
