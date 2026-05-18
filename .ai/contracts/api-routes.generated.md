# API Routes Snapshot

> Generated file. Do not edit by hand.
> Run `pnpm ai:contracts` to refresh all contract snapshots.

## Routes

| Method | Path | Source | Auth middleware |
| --- | --- | --- | --- |
| GET | `/auth/session` | `packages/api/src/router/auth.ts` | yes |
| GET | `/auth/secret` | `packages/api/src/router/auth.ts` | yes |
| GET | `/apikeys` | `packages/api/src/router/api-key.ts` | yes |
| POST | `/apikeys` | `packages/api/src/router/api-key.ts` | yes |
| DELETE | `/apikeys/:id` | `packages/api/src/router/api-key.ts` | yes |
| POST | `/support` | `packages/api/src/router/support.ts` | no |
| GET | `/health` | `packages/api/src/index.ts` | no |

## Typed client source

- `packages/api/src/index.ts` exports `AppType` and `hcWithType`.
- Web and mobile clients should infer from `AppType` instead of hand-written route types.
