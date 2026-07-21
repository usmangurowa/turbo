# Feature Spec: Dependency modernization 2026-06

## Status

- State: shipped
- Owner: AI agent
- Created: 2026-06-05
- Updated: 2026-06-06

## Problem

The branch already modernized several packages, but newer package versions and framework guidance are now available. The repository should upgrade compatible direct dependencies across the pnpm workspace, with special care for Expo SDK, Next.js, Hono, Better Auth, React, and React Native peer compatibility.

## Acceptance Criteria

- [x] Direct dependencies are audited against current registry versions and official upgrade guidance.
- [x] Package manifests and lockfile are updated to the latest compatible versions, not merely the numerically latest incompatible versions.
- [x] Expo SDK packages are upgraded using the Expo SDK 57-compatible dependency set, including React Native and Reanimated peers.
- [x] Next.js, Hono, and Better Auth updates are applied with required code/config migrations where the current codebase uses affected APIs.
- [x] Deprecated or superseded packages are handled explicitly, either upgraded, retained with rationale, or replaced if safe.
- [x] Generated AI context and tech-stack documentation reflect dependency changes.
- [x] Validation passes or any remaining blockers are documented with exact failing commands.

## Expected Files

| File | Expected change |
| --- | --- |
| `package.json` | Root tooling dependency/version script changes as needed. |
| `pnpm-workspace.yaml` | Catalog and override updates for shared versions and peer alignment. |
| `pnpm-lock.yaml` | Regenerated lockfile after dependency changes. |
| `apps/web/package.json` | Next.js, Sentry, Hono, React-compatible dependency updates. |
| `apps/mobile/package.json` | Expo SDK 57, React Native, Expo modules, and native peer updates. |
| `packages/*/package.json` | Compatible direct dependency updates across internal packages. |
| `tooling/*/package.json` | Tooling dependency updates where compatible. |
| `apps/web/next.config.js` | Next.js 16/Turbopack config migration only if required by current config. |
| `packages/auth/src/index.ts` | Better Auth import/config migration only if required by latest stable guidance. |
| `.ai/context/tech-stack.md` | Update observed framework and tool versions. |
| `.ai/contracts/*.generated.md` | Refresh generated AI contracts/context if dependency graph or package facts change. |

## Contracts

| Contract | Change? | Notes |
| --- | --- | --- |
| API routes | no | Route behavior should not change; Hono version may affect types/security fixes. |
| DB schema | possible | Better Auth schema generation may change auth table metadata; only commit if generated output changes intentionally. |
| Env vars | no | No new env vars expected. |
| Package exports | possible | Only if package dependency/export snapshots change after contract generation. |
| UI tokens | no | No design token changes expected. |
| Agent memory | yes | Tech-stack and generated context must reflect dependency versions. |

## Pseudocode

```text
1. Audit direct dependencies with pnpm outdated and npm metadata.
2. Research official upgrade guidance for Expo SDK 57, Next 16, Hono, Better Auth, and related peers.
3. Choose latest compatible versions, keeping Node 22 type/runtime alignment.
4. Update manifests/catalogs, then run pnpm install to regenerate lockfile.
5. Run Expo dependency alignment and doctor checks for mobile.
6. Apply required code/config migrations from validation failures and official guidance.
7. Refresh AI contracts/context and tech-stack docs.
8. Validate with install, typecheck, lint, tests, and focused builds where feasible.
```

## Validation Plan

- [x] `pnpm install`
- [x] `pnpm -F @turbo/mobile exec expo install --check`
- [x] `pnpm -F @turbo/mobile exec expo-doctor`
- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm test`
- [x] `pnpm ai:context`
- [x] `pnpm -F @turbo/web build`

## Rollback Plan

Revert the dependency manifest, lockfile, and compatibility edits as one changeset. If Expo SDK 57 introduces native/runtime blockers, roll mobile back to the previous SDK 55-aligned dependency set while retaining safe patch updates for non-mobile packages.

## Notes

- Keep `@types/node` on the latest Node 22 line rather than the registry latest Node 25 line because the repo runtime is Node 22.
- Prefer stable releases over prereleases, e.g. Better Auth 1.6.x rather than 1.7 beta.
- Expo SDK 57 includes React Native 0.86 and React 19.2; Reanimated 4.5 requires `react-native-worklets@0.10.x` (SDK-pinned; do not bump to 0.11 until Expo does).
- Next.js 16 uses Turbopack by default; the current web scripts intentionally use `--webpack`, so Turbopack migration should be validated rather than assumed.

## Outcome (2026-06-06)

Shipped in two passes: minors/patches via taze, then majors.

Major upgrades applied:

- Expo SDK 56 → 57 (React Native 0.86, all `expo-*` modules, `@expo/dom-webview`/`@expo/metro-runtime` overrides updated). `expo-doctor` 20/20; `expo export` bundles.
- Vercel AI SDK `ai` 6 → 7 with `@ai-sdk/google` 4, `@ai-sdk/groq` 4, `@openrouter/ai-sdk-provider` 3. No code changes needed.
- `@hono/node-server` 1 → 2. `serve()` API unchanged for our usage; `/health` smoke-tested.
- ESLint 9 → 10 (`eslint`, `@eslint/js` in catalog). Plugins `eslint-plugin-import`/`react`/`jsx-a11y` declare only `^9` peers but run clean on 10 — peer warnings are expected and harmless.
- `@react-email/components` (deprecated) removed; components/`render` now import from `react-email` ^6.9 (moved to runtime dependencies in `@turbo/mail`).
- Vite 7 → 8, `@vitejs/plugin-react` 5 → 6 (catalog).
- Prettier override `3.8.3` removed; workspace now on 3.9.x.
- `react-native-url-polyfill` 3 → 4, `@hono/zod-validator` 0.9, recharts 3.10, react/react-dom 19.2.8.

Deliberately NOT upgraded (with rationale):

- TypeScript 7: blocked by `typescript-eslint` peer range `<6.1.0`.
- `@types/node` 26: repo runtime pinned to Node 22 (`engines`).
- `@sentry/react-native` 8, `react-native-gesture-handler` 3, `react-native-screens` 4.26, `react-native-worklets` 0.11, pager-view/svg/safe-area-context patches: Expo SDK 57 pins exact native module versions; bumps fail `expo-doctor` and can break native builds. Revisit at SDK 58.
- `react`/`react-dom` 19.2.8 exceed Expo's expected 19.2.3 at patch level only; excluded via `expo.install.exclude`.
