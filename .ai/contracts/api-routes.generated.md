# API Routes Snapshot

> Generated file. Do not edit by hand.
> Run `pnpm ai:contracts` to refresh this generated file.

## Routes

| Method | Path | Source | Auth middleware |
| --- | --- | --- | --- |
| DELETE | `/apikeys/:id` | `packages/api/src/router/api-key.ts` | yes |
| GET | `/apikeys` | `packages/api/src/router/api-key.ts` | yes |
| GET | `/auth/secret` | `packages/api/src/router/auth.ts` | yes |
| GET | `/auth/session` | `packages/api/src/router/auth.ts` | no |
| GET | `/health` | `packages/api/src/index.ts` | no |
| GET | `/tasks` | `packages/api/src/router/task.ts` | no |
| POST | `/ai/chat` | `packages/api/src/router/ai.ts` | yes |
| POST | `/apikeys` | `packages/api/src/router/api-key.ts` | yes |
| POST | `/support` | `packages/api/src/router/support.ts` | yes |
| POST | `/tasks` | `packages/api/src/router/task.ts` | yes |

## Typed client source

- `packages/api/src/index.ts` exports `AppType` and `hcWithType`.
- Web and mobile clients should infer from `AppType` instead of hand-written route types.
