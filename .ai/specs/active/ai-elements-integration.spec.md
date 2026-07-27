# Feature Spec: AI Elements integration in @turbo/ui

## Status

- State: implemented
- Owner: AI agent
- Created: 2026-07-26
- Updated: 2026-07-26

## Problem

Apps need production-ready AI chat UI (conversation, message threads, prompt
input, reasoning, sources, tool calls). Building these from scratch is slow.
Vercel's AI Elements (https://elements.ai-sdk.dev) is a free, shadcn-distributed
component kit that composes our existing shadcn primitives.

## Acceptance Criteria

- [x] Full AI Elements core kit installed under
      `packages/ui/src/components/ai-elements/`
- [x] AI Elements components import our existing shadcn primitives
      (`@turbo/ui/components/button`, etc.) — no duplicated primitives
- [x] Existing `message.tsx` (layout primitive) is untouched; no collisions
- [x] Components importable as `@turbo/ui/components/ai-elements/<name>`
- [x] `pnpm typecheck` and `pnpm lint` pass in `packages/ui`

## Expected Files

| File                                           | Expected change                    |
| ---------------------------------------------- | ---------------------------------- |
| `packages/ui/src/components/ai-elements/*.tsx` | new — ~30 components from registry |
| `packages/ui/package.json`                     | add deps: `ai`, `streamdown`, etc. |
| `packages/ui/components.json`                  | possibly register registry alias   |
| `.ai/context/tech-stack.md`                    | document AI Elements dependency    |
| `.ai/context/conventions.md`                   | note ai-elements folder convention |

## Contracts

| Contract        | Change? | Notes                                       |
| --------------- | ------- | ------------------------------------------- |
| API routes      | no      |                                             |
| DB schema       | no      |                                             |
| Env vars        | no      |                                             |
| Package exports | no      | existing `./components/*` glob covers depth |
| UI tokens       | no      | AI Elements uses shadcn semantic tokens     |
| Agent memory    | yes     | tech-stack + conventions updates            |

## Pseudocode

```text
1. Install AI Elements via shadcn CLI into components/ai-elements/.
2. Verify imports resolve to existing @turbo/ui primitives via aliases.
3. Fix export map if needed for nested component paths.
4. Typecheck, lint, format.
5. Update .ai memory + run pnpm ai:contracts (deps changed).
```

## Validation Plan

- [x] `pnpm --filter @turbo/ui typecheck`
- [x] `pnpm --filter @turbo/ui lint`
- [x] `pnpm ai:contracts`

## Rollback Plan

Delete `packages/ui/src/components/ai-elements/`, revert `package.json` dep
additions, and reinstall lockfile.

## Notes

- Our `message.tsx` is a layout primitive (data-slot pattern); AI Elements
  `message` is an AI-SDK-coupled chat message. Both kept — no merge.
- AI Elements uses `lucide-react` icons; repo icon library is hugeicons. Kept
  as-is inside ai-elements (CLI-managed files, documented patches only).
