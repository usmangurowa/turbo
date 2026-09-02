import { readFile } from "node:fs/promises";

import { fromRoot } from "./_lib.mjs";

const DESIGN_FILE = "DESIGN.md";
const REPO_THEME_FILE = "tooling/tailwind/theme.css";
const TAILWIND_THEME_FILE = "node_modules/tailwindcss/theme.css";

const COLOR_TOLERANCE = { l: 0.005, c: 0.005, h: 0.5, alpha: 0.005 };
const TYPOGRAPHY_ROLES = {
  caption: { size: "xs", weight: "normal", tracking: "body" },
  "body-sm": { size: "sm", weight: "normal", tracking: "body" },
  body: { size: "base", weight: "normal", tracking: "body" },
  label: { size: "sm", weight: "medium", tracking: "body" },
  title: { size: "base", weight: "semibold", tracking: "body" },
  heading: { size: "2xl", weight: "bold", tracking: "body" },
  display: { size: "5xl", weight: "medium", tracking: "tight" },
};
const SPACING_MULTIPLIERS = {
  unit: 1,
  micro: 2,
  control: 3,
  compact: 4,
  component: 6,
  section: 12,
  page: 24,
  "page-large": 32,
};
const SHADOW_NAMES = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "inner"];

const stripQuotes = (value) => {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
};

const parseFrontMatter = (content) => {
  const lines = content.split(/\r?\n/);
  if (lines[0] !== "---") {
    throw new Error(`${DESIGN_FILE}:1: front matter must start with ---`);
  }

  const end = lines.indexOf("---", 1);
  if (end === -1) {
    throw new Error(`${DESIGN_FILE}: front matter is missing its closing ---`);
  }

  const tokens = {};
  const locations = {};
  let section;
  let nestedToken;

  for (let index = 1; index < end; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trimStart().startsWith("#")) continue;

    const topLevel = line.match(/^([a-zA-Z][\w-]*):(?:\s*(.*))?$/);
    if (topLevel) {
      section = topLevel[1];
      nestedToken = undefined;
      if (!topLevel[2]) tokens[section] = {};
      continue;
    }

    const secondLevel = line.match(/^ {2}([\w-]+):(?:\s*(.*))?$/);
    if (secondLevel && section) {
      const [, key, rawValue] = secondLevel;
      locations[`${section}.${key}`] = index + 1;
      if (rawValue) {
        tokens[section] ??= {};
        tokens[section][key] = stripQuotes(rawValue);
        nestedToken = undefined;
      } else {
        tokens[section] ??= {};
        tokens[section][key] = {};
        nestedToken = key;
      }
      continue;
    }

    const fourthLevel = line.match(/^ {4}([\w-]+):\s*(.+)$/);
    if (fourthLevel && section && nestedToken) {
      const [, key, rawValue] = fourthLevel;
      tokens[section][nestedToken][key] = stripQuotes(rawValue);
      locations[`${section}.${nestedToken}.${key}`] = index + 1;
      continue;
    }

    throw new Error(
      `${DESIGN_FILE}:${index + 1}: unsupported front matter syntax`,
    );
  }

  return { tokens, locations };
};

const stripCssComments = (content) => content.replace(/\/\*[\s\S]*?\*\//g, "");

const extractBlock = (content, marker) => {
  const markerIndex = content.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`${REPO_THEME_FILE}: missing ${marker} block`);
  }

  const openIndex = content.indexOf("{", markerIndex + marker.length);
  if (openIndex === -1) {
    throw new Error(`${REPO_THEME_FILE}: malformed ${marker} block`);
  }

  let depth = 1;
  for (let index = openIndex + 1; index < content.length; index += 1) {
    if (content[index] === "{") depth += 1;
    if (content[index] === "}") depth -= 1;
    if (depth === 0) return content.slice(openIndex + 1, index);
  }

  throw new Error(`${REPO_THEME_FILE}: unclosed ${marker} block`);
};

const parseDeclarations = (content) =>
  Object.fromEntries(
    [...content.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((match) => [
      match[1],
      match[2].replace(/\s+/g, " ").trim(),
    ]),
  );

const resolveOneVar = (value, ...scopes) => {
  const reference = value.match(/^var\(--([\w-]+)\)$/);
  if (!reference) return value;

  for (const scope of scopes) {
    if (scope[reference[1]] !== undefined) return scope[reference[1]];
  }

  throw new Error(`unresolved CSS variable --${reference[1]}`);
};

const formatNumber = (value, precision = 6) =>
  Number(value.toFixed(precision)).toString();

const lineAt = (content, index) =>
  content.slice(0, index).split(/\r?\n/).length;

const parseDimension = (value) => {
  const match = String(value)
    .trim()
    .match(/^(-?\d*\.?\d+)(px|rem|em)$/);
  if (!match) return null;
  const amount = Number(match[1]);
  return {
    amount,
    unit: match[2],
    px: match[2] === "px" ? amount : amount * 16,
  };
};

const multiplyDimension = (value, multiplier) => {
  const dimension = parseDimension(value);
  if (!dimension) throw new Error(`invalid spacing unit: ${value}`);
  return `${formatNumber(dimension.amount * multiplier)}${dimension.unit}`;
};

const evaluateDivision = (value) => {
  const expression = String(value).trim();
  const division = expression.match(
    /^calc\(\s*(-?\d*\.?\d+)\s*\/\s*(-?\d*\.?\d+)\s*\)$/,
  );
  if (!division) return expression;
  return formatNumber(Number(division[1]) / Number(division[2]));
};

const evaluateRadius = (value, baseValue) => {
  const resolved = resolveOneVar(value, { radius: baseValue });
  const direct = parseDimension(resolved);
  if (direct) return `${formatNumber(direct.px / 16)}rem`;

  const calculation = resolved.match(
    /^calc\(var\(--radius\)\s*([+-])\s*(\d*\.?\d+)px\)$/,
  );
  const base = parseDimension(baseValue);
  if (!calculation || !base) {
    throw new Error(`unsupported radius expression: ${value}`);
  }

  const offset = Number(calculation[2]) * (calculation[1] === "-" ? -1 : 1);
  return `${formatNumber((base.px + offset) / 16)}rem`;
};

const inferFontFamily = (themeDeclarations) => {
  const family = themeDeclarations["font-inter"]?.match(/"([^"]+)"/)?.[1];
  if (!family) {
    throw new Error(`${REPO_THEME_FILE}: --font-inter has no quoted family`);
  }

  return family.replace(/-Regular$/, "").replace(/([a-z])([A-Z])/g, "$1 $2");
};

const buildRuntimeTokens = (repoCss, tailwindCss) => {
  const cleanRepoCss = stripCssComments(repoCss);
  const cleanTailwindCss = stripCssComments(tailwindCss);
  const rootBlock = extractBlock(cleanRepoCss, ":root");
  const lightBlock = extractBlock(rootBlock, "@variant light");
  const darkBlock = extractBlock(rootBlock, "@variant dark");
  const globalBlock = rootBlock.slice(0, rootBlock.indexOf("@variant light"));
  const inlineTheme = parseDeclarations(
    extractBlock(cleanRepoCss, "@theme inline"),
  );
  const defaults = parseDeclarations(
    extractBlock(cleanTailwindCss, "@theme default"),
  );
  const allTailwindDeclarations = parseDeclarations(cleanTailwindCss);
  const globalDeclarations = parseDeclarations(globalBlock);
  const lightDeclarations = parseDeclarations(lightBlock);
  const darkDeclarations = parseDeclarations(darkBlock);

  const colors = {};
  for (const [name, value] of Object.entries(globalDeclarations)) {
    if (/^primary-\d+$/.test(name)) colors[name] = value;
  }
  for (const [name, value] of Object.entries(lightDeclarations)) {
    if (name !== "radius") {
      colors[name] = resolveOneVar(
        value,
        lightDeclarations,
        globalDeclarations,
      );
    }
  }
  for (const [name, value] of Object.entries(darkDeclarations)) {
    if (name !== "radius") {
      colors[`${name}-dark`] = resolveOneVar(
        value,
        darkDeclarations,
        globalDeclarations,
      );
    }
  }

  const bodyTracking = cleanRepoCss.match(
    /body\s*\{[\s\S]*?letter-spacing:\s*([^;]+);/,
  )?.[1];
  if (!bodyTracking) {
    throw new Error(`${REPO_THEME_FILE}: body letter-spacing is missing`);
  }

  const fontFamily = inferFontFamily(inlineTheme);
  const typography = Object.fromEntries(
    Object.entries(TYPOGRAPHY_ROLES).map(([name, role]) => [
      name,
      {
        fontFamily,
        fontSize: defaults[`text-${role.size}`],
        fontWeight: defaults[`font-weight-${role.weight}`],
        lineHeight: evaluateDivision(
          defaults[`text-${role.size}--line-height`],
        ),
        letterSpacing:
          role.tracking === "body"
            ? bodyTracking.trim()
            : defaults[`tracking-${role.tracking}`],
      },
    ]),
  );

  const spacingUnit = defaults.spacing;
  if (!spacingUnit) {
    throw new Error(`${TAILWIND_THEME_FILE}: --spacing is missing`);
  }
  const spacing = Object.fromEntries(
    Object.entries(SPACING_MULTIPLIERS).map(([name, multiplier]) => [
      name,
      multiplyDimension(spacingUnit, multiplier),
    ]),
  );

  const baseRadius = lightDeclarations.radius;
  if (!baseRadius || darkDeclarations.radius !== baseRadius) {
    throw new Error(
      `${REPO_THEME_FILE}: light and dark --radius values must match`,
    );
  }
  const rounded = {};
  for (const name of ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"]) {
    rounded[name] = evaluateRadius(inlineTheme[`radius-${name}`], baseRadius);
  }

  const shadows = Object.fromEntries(
    SHADOW_NAMES.map((name) => {
      const cssName = name === "inner" ? "shadow-inner" : `shadow-${name}`;
      const value = defaults[cssName] ?? allTailwindDeclarations[cssName];
      if (!value) {
        throw new Error(`${TAILWIND_THEME_FILE}: --${cssName} is missing`);
      }
      return [name, value];
    }),
  );

  const colorMappings = Object.fromEntries(
    Object.entries(inlineTheme)
      .filter(([name]) => name.startsWith("color-"))
      .map(([name, value]) => [name.slice("color-".length), value]),
  );

  return { colors, colorMappings, typography, spacing, rounded, shadows };
};

const srgbChannelToLinear = (channel) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const hexToOklch = (value) => {
  let hex = value.slice(1);
  if (hex.length === 3 || hex.length === 4) {
    hex = [...hex].map((character) => character.repeat(2)).join("");
  }
  if (hex.length !== 6 && hex.length !== 8) {
    throw new Error(`unsupported hex color: ${value}`);
  }

  const [r, g, b] = [0, 2, 4].map((index) =>
    srgbChannelToLinear(Number.parseInt(hex.slice(index, index + 2), 16) / 255),
  );
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(a, bAxis);
  const hue = (Math.atan2(bAxis, a) * 180) / Math.PI;

  return {
    l: lightness,
    c: chroma,
    h: hue < 0 ? hue + 360 : hue,
    alpha: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
};

const parsePercentageOrNumber = (value, percentageScale = 1) =>
  value.endsWith("%")
    ? (Number(value.slice(0, -1)) / 100) * percentageScale
    : Number(value);

const parseColor = (value) => {
  const normalized = String(value).trim().toLowerCase();
  if (normalized.startsWith("#")) return hexToOklch(normalized);

  const match = normalized.match(
    /^oklch\(\s*([+-]?\d*\.?\d+%?)\s+([+-]?\d*\.?\d+%?)\s+([+-]?\d*\.?\d+)(?:\s*\/\s*([+-]?\d*\.?\d+%?))?\s*\)$/,
  );
  if (!match) throw new Error(`unsupported color: ${value}`);

  return {
    l: parsePercentageOrNumber(match[1]),
    c: parsePercentageOrNumber(match[2], 0.4),
    h: ((Number(match[3]) % 360) + 360) % 360,
    alpha: match[4] ? parsePercentageOrNumber(match[4]) : 1,
  };
};

const hueDistance = (left, right) => {
  const distance = Math.abs(left - right);
  return Math.min(distance, 360 - distance);
};

const colorDifferences = (left, right) => ({
  l: Math.abs(left.l - right.l),
  c: Math.abs(left.c - right.c),
  h: left.c < 0.01 || right.c < 0.01 ? 0 : hueDistance(left.h, right.h),
  alpha: Math.abs(left.alpha - right.alpha),
});

const assertColorMath = () => {
  const fixtures = [
    ["#000000", { l: 0, c: 0, h: 0 }],
    ["#ffffff", { l: 1, c: 0, h: 0 }],
    ["#ff0000", { l: 0.627955, c: 0.257683, h: 29.2339 }],
    ["#0659ff", { l: 0.5406, c: 0.2549, h: 262.56 }],
  ];

  for (const [hex, expected] of fixtures) {
    const actual = hexToOklch(hex);
    const differences = colorDifferences(actual, { ...expected, alpha: 1 });
    if (differences.l > 0.001 || differences.c > 0.001 || differences.h > 0.2) {
      throw new Error(
        `hex to OKLCH self-check failed for ${hex}: ${JSON.stringify(actual)}`,
      );
    }
  }
};

const normalizeScalar = (value) =>
  String(value)
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim();

const scalarsEqual = (documented, runtime) => {
  const leftDimension = parseDimension(documented);
  const rightDimension = parseDimension(runtime);
  if (leftDimension && rightDimension) {
    return Math.abs(leftDimension.px - rightDimension.px) <= 0.001;
  }

  const leftNumber = Number(documented);
  const rightNumber = Number(runtime);
  if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
    return Math.abs(leftNumber - rightNumber) <= 0.000001;
  }

  return normalizeScalar(documented) === normalizeScalar(runtime);
};

const compareFlatGroup = (group, documented, runtime, locations, findings) => {
  const documentedKeys = Object.keys(documented ?? {}).sort();
  const runtimeKeys = Object.keys(runtime).sort();

  for (const key of runtimeKeys.filter(
    (name) => !documentedKeys.includes(name),
  )) {
    findings.push({
      line: 1,
      rule: "design-token-missing",
      message: `${group}.${key} is missing; runtime is ${runtime[key]}`,
    });
  }
  for (const key of documentedKeys.filter(
    (name) => !runtimeKeys.includes(name),
  )) {
    findings.push({
      line: locations[`${group}.${key}`] ?? 1,
      rule: "design-token-extra",
      message: `${group}.${key} has no runtime token`,
    });
  }

  for (const key of runtimeKeys.filter((name) =>
    documentedKeys.includes(name),
  )) {
    let matches;
    try {
      if (group === "colors") {
        const differences = colorDifferences(
          parseColor(documented[key]),
          parseColor(runtime[key]),
        );
        matches = Object.entries(COLOR_TOLERANCE).every(
          ([channel, tolerance]) => differences[channel] <= tolerance,
        );
      } else {
        matches = scalarsEqual(documented[key], runtime[key]);
      }
    } catch (error) {
      findings.push({
        line: locations[`${group}.${key}`] ?? 1,
        rule: "design-token-invalid",
        message: `${group}.${key}: ${error.message}`,
      });
      continue;
    }

    if (!matches) {
      findings.push({
        line: locations[`${group}.${key}`] ?? 1,
        rule: "design-token-drift",
        message: `${group}.${key} is ${documented[key]}; runtime is ${runtime[key]}`,
      });
    }
  }
};

const compareTypography = (documented, runtime, locations, findings) => {
  const documentedKeys = Object.keys(documented ?? {}).sort();
  const runtimeKeys = Object.keys(runtime).sort();

  for (const key of runtimeKeys.filter(
    (name) => !documentedKeys.includes(name),
  )) {
    findings.push({
      line: 1,
      rule: "design-token-missing",
      message: `typography.${key} is missing`,
    });
  }
  for (const key of documentedKeys.filter(
    (name) => !runtimeKeys.includes(name),
  )) {
    findings.push({
      line: locations[`typography.${key}`] ?? 1,
      rule: "design-token-extra",
      message: `typography.${key} has no runtime role`,
    });
  }

  for (const key of runtimeKeys.filter((name) =>
    documentedKeys.includes(name),
  )) {
    const documentedFields = documented[key];
    const runtimeFields = runtime[key];
    for (const field of Object.keys(runtimeFields)) {
      const path = `typography.${key}.${field}`;
      if (documentedFields[field] === undefined) {
        findings.push({
          line: locations[`typography.${key}`] ?? 1,
          rule: "design-token-missing",
          message: `${path} is missing; runtime is ${runtimeFields[field]}`,
        });
      } else if (!scalarsEqual(documentedFields[field], runtimeFields[field])) {
        findings.push({
          line: locations[path] ?? locations[`typography.${key}`] ?? 1,
          rule: "design-token-drift",
          message: `${path} is ${documentedFields[field]}; runtime is ${runtimeFields[field]}`,
        });
      }
    }

    for (const field of Object.keys(documentedFields)) {
      if (runtimeFields[field] === undefined) {
        findings.push({
          line: locations[`typography.${key}.${field}`] ?? 1,
          rule: "design-token-extra",
          message: `typography.${key}.${field} has no runtime field`,
        });
      }
    }
  }
};

const main = async () => {
  assertColorMath();

  const [designContent, repoCss, tailwindCss] = await Promise.all([
    readFile(fromRoot(DESIGN_FILE), "utf8"),
    readFile(fromRoot(REPO_THEME_FILE), "utf8"),
    readFile(fromRoot(TAILWIND_THEME_FILE), "utf8"),
  ]);
  const { tokens, locations } = parseFrontMatter(designContent);
  const runtime = buildRuntimeTokens(repoCss, tailwindCss);
  const findings = [];

  compareFlatGroup(
    "colors",
    tokens.colors,
    runtime.colors,
    locations,
    findings,
  );
  const expectedColorMappings = new Set(
    Object.keys(runtime.colors).map((name) => name.replace(/-dark$/, "")),
  );
  for (const name of expectedColorMappings) {
    const mapping = runtime.colorMappings[name];
    const expected = `var(--${name})`;
    if (mapping !== expected) {
      const declaration = `--color-${name}`;
      findings.push({
        file: REPO_THEME_FILE,
        line: lineAt(repoCss, Math.max(0, repoCss.indexOf(declaration))),
        rule: "runtime-token-mapping",
        message: `${declaration} must map to ${expected}; found ${mapping ?? "missing"}`,
      });
    }
  }
  for (const name of Object.keys(runtime.colorMappings)) {
    if (!expectedColorMappings.has(name)) {
      const declaration = `--color-${name}`;
      findings.push({
        file: REPO_THEME_FILE,
        line: lineAt(repoCss, Math.max(0, repoCss.indexOf(declaration))),
        rule: "runtime-token-extra",
        message: `${declaration} has no matching documented runtime color`,
      });
    }
  }
  compareTypography(tokens.typography, runtime.typography, locations, findings);
  for (const group of ["spacing", "rounded", "shadows"]) {
    compareFlatGroup(group, tokens[group], runtime[group], locations, findings);
  }

  findings.sort(
    (left, right) =>
      left.line - right.line ||
      left.rule.localeCompare(right.rule) ||
      left.message.localeCompare(right.message),
  );

  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(
        `${finding.file ?? DESIGN_FILE}:${finding.line}: error ${finding.rule} ${finding.message}`,
      );
    }
    console.error(
      `Design token check failed with ${findings.length} error(s).`,
    );
    process.exitCode = 1;
    return;
  }

  const tokenCount =
    Object.keys(runtime.colors).length +
    Object.keys(runtime.typography).length +
    Object.keys(runtime.spacing).length +
    Object.keys(runtime.rounded).length +
    Object.keys(runtime.shadows).length;
  console.log(`Design tokens match runtime sources (${tokenCount} tokens).`);
};

await main();
