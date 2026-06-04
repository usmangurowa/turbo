import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import * as ts from "typescript";

import {
  formatTable,
  fromRoot,
  markdownList,
  writeGenerated,
} from "./_lib.mjs";

const methodNames = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "all",
]);

const routeRowCompare = (a, b) => {
  const methodDiff = a[0].localeCompare(b[0]);
  if (methodDiff !== 0) return methodDiff;

  const pathDiff = a[1].localeCompare(b[1]);
  if (pathDiff !== 0) return pathDiff;

  return a[2].localeCompare(b[2]);
};

const joinRoute = (basePath, routePath) => {
  const joined = `${basePath}/${routePath}`.replaceAll(/\/+/g, "/");
  return joined === "/" ? "/" : joined.replace(/\/$/, "");
};

const createSourceFile = async (filePath) =>
  ts.createSourceFile(
    filePath,
    await readFile(fromRoot(filePath), "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

const getStringLiteralValue = (node) =>
  node && ts.isStringLiteralLike(node) ? node.text : null;

const getPropertyCallName = (callExpression) =>
  ts.isPropertyAccessExpression(callExpression.expression)
    ? callExpression.expression.name.text
    : null;

const isBuilderChainCall = (node) => {
  if (
    !ts.isCallExpression(node) ||
    !ts.isPropertyAccessExpression(node.expression)
  ) {
    return false;
  }

  const receiver = node.expression.expression;
  return ts.isCallExpression(receiver) || ts.isNewExpression(receiver);
};

const nodeContainsIdentifier = (node, name) => {
  let found = false;

  const visit = (child) => {
    if (found) return;
    if (ts.isIdentifier(child) && child.text === name) {
      found = true;
      return;
    }
    ts.forEachChild(child, visit);
  };

  visit(node);
  return found;
};

const collectApiRoutesFromRouter = async (routerFile, basePath) => {
  const sourceFile = await createSourceFile(routerFile);
  const rows = [];
  let routerWideAuth = false;

  const walk = (node) => {
    if (isBuilderChainCall(node)) {
      const methodName = getPropertyCallName(node);

      if (methodName === "use") {
        const wildcardMounted =
          getStringLiteralValue(node.arguments[0]) === "*";
        const hasAuthMiddleware = node.arguments.some((argument) =>
          nodeContainsIdentifier(argument, "authMiddleware"),
        );

        if (wildcardMounted && hasAuthMiddleware) {
          routerWideAuth = true;
        }
      }

      if (methodName && methodNames.has(methodName)) {
        const routePath = getStringLiteralValue(node.arguments[0]);
        if (routePath) {
          const routeUsesAuth =
            routerWideAuth ||
            node.arguments
              .slice(1)
              .some((argument) =>
                nodeContainsIdentifier(argument, "authMiddleware"),
              );

          rows.push([
            methodName.toUpperCase(),
            `\`${joinRoute(basePath, routePath)}\``,
            `\`${routerFile}\``,
            routeUsesAuth ? "yes" : "no",
          ]);
        }
      }
    }

    ts.forEachChild(node, walk);
  };

  walk(sourceFile);
  return rows;
};

const collectDbRowsFromSchema = async (schemaFile) => {
  const sourceFile = await createSourceFile(schemaFile);
  const tableRows = [];
  const relationRows = [];

  const walk = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      const initializer = node.initializer;

      if (initializer && ts.isCallExpression(initializer)) {
        const callName =
          ts.isIdentifier(initializer.expression) &&
          initializer.expression.text;

        if (callName === "pgTable") {
          const tableName = getStringLiteralValue(initializer.arguments[0]);
          if (tableName) {
            tableRows.push([
              `\`${node.name.text}\``,
              `\`${tableName}\``,
              `\`${schemaFile}\``,
            ]);
          }
        }

        if (callName === "relations") {
          const relationTable =
            initializer.arguments[0] &&
            ts.isIdentifier(initializer.arguments[0])
              ? initializer.arguments[0].text
              : null;

          if (relationTable) {
            relationRows.push([
              `\`${node.name.text}\``,
              `\`${relationTable}\``,
              `\`${schemaFile}\``,
            ]);
          }
        }
      }
    }

    ts.forEachChild(node, walk);
  };

  walk(sourceFile);
  return { tableRows, relationRows };
};

const generateApiSnapshot = async () => {
  const sourceFile = await createSourceFile("packages/api/src/index.ts");
  const importMap = new Map();
  const routeRows = [];
  const routeTasks = [];

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;

    const modulePath = statement.moduleSpecifier.text;
    const importClause = statement.importClause;

    if (
      modulePath.startsWith("./router/") &&
      importClause?.name &&
      ts.isIdentifier(importClause.name)
    ) {
      importMap.set(
        importClause.name.text,
        `packages/api/src/router/${modulePath.slice("./router/".length)}.ts`,
      );
    }
  }

  const walk = (node) => {
    if (isBuilderChainCall(node)) {
      const methodName = node.expression.name.text;

      if (methodName === "route") {
        const basePath = getStringLiteralValue(node.arguments[0]);
        const routerIdentifier =
          node.arguments[1] && ts.isIdentifier(node.arguments[1])
            ? node.arguments[1].text
            : null;

        if (basePath && routerIdentifier && importMap.has(routerIdentifier)) {
          const routerFile = importMap.get(routerIdentifier);
          routeTasks.push(
            collectApiRoutesFromRouter(routerFile, basePath).then((rows) => {
              routeRows.push(...rows);
            }),
          );
        }
      }

      if (methodNames.has(methodName) && node.expression.expression) {
        const routePath = getStringLiteralValue(node.arguments[0]);
        if (routePath) {
          const routeUsesAuth = node.arguments
            .slice(1)
            .some((argument) =>
              nodeContainsIdentifier(argument, "authMiddleware"),
            );

          routeRows.push([
            methodName.toUpperCase(),
            `\`${routePath}\``,
            "`packages/api/src/index.ts`",
            routeUsesAuth ? "yes" : "no",
          ]);
        }
      }
    }

    ts.forEachChild(node, walk);
  };

  walk(sourceFile);
  await Promise.all(routeTasks);
  routeRows.sort(routeRowCompare);

  await writeGenerated(
    ".ai/contracts/api-routes.generated.md",
    "API Routes Snapshot",
    [
      "## Routes",
      "",
      formatTable(["Method", "Path", "Source", "Auth middleware"], routeRows),
      "",
      "## Typed client source",
      "",
      "- `packages/api/src/index.ts` exports `AppType` and `hcWithType`.",
      "- Web and mobile clients should infer from `AppType` instead of hand-written route types.",
    ].join("\n"),
  );

  console.log("Wrote .ai/contracts/api-routes.generated.md");
};

const generateDbSnapshot = async () => {
  const schemaDir = fromRoot("packages/db/src");
  const entries = await readdir(schemaDir, { withFileTypes: true });
  const schemaFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith("schema.ts"))
    .map((entry) => `packages/db/src/${entry.name}`)
    .sort();

  const tableRows = [];
  const relationRows = [];

  for (const schemaFile of schemaFiles) {
    const { tableRows: fileTableRows, relationRows: fileRelationRows } =
      await collectDbRowsFromSchema(schemaFile);
    tableRows.push(...fileTableRows);
    relationRows.push(...fileRelationRows);
  }

  await writeGenerated(
    ".ai/contracts/db-schema.generated.md",
    "Database Schema Snapshot",
    [
      "## Schema files",
      "",
      markdownList(schemaFiles),
      "",
      "## Tables",
      "",
      formatTable(["Export", "DB table", "Source"], tableRows),
      "",
      "## Relations",
      "",
      formatTable(["Export", "Table export", "Source"], relationRows),
    ].join("\n"),
  );

  console.log("Wrote .ai/contracts/db-schema.generated.md");
};

const runNodeScript = (scriptPath) => {
  const result = spawnSync(process.execPath, [fromRoot(scriptPath)], {
    cwd: fromRoot(),
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

await generateApiSnapshot();
await generateDbSnapshot();
runNodeScript("scripts/ai/check-env-contract.mjs");
runNodeScript("scripts/ai/package-graph.mjs");

console.log("AI contract snapshots are up to date.");
