# Database Schema Snapshot

> Generated file. Do not edit by hand.
> Run `pnpm ai:contracts` to refresh this generated file.

## Schema files

- `packages/db/src/app-schema.ts`
- `packages/db/src/auth-schema.ts`
- `packages/db/src/schema.ts`

## Tables

| Export | DB table | Source |
| --- | --- | --- |
| `task` | `task` | `packages/db/src/app-schema.ts` |
| `user` | `user` | `packages/db/src/auth-schema.ts` |
| `session` | `session` | `packages/db/src/auth-schema.ts` |
| `account` | `account` | `packages/db/src/auth-schema.ts` |
| `verification` | `verification` | `packages/db/src/auth-schema.ts` |
| `apikey` | `apikey` | `packages/db/src/auth-schema.ts` |

## Relations

| Export | Table export | Source |
| --- | --- | --- |
| `userRelations` | `user` | `packages/db/src/auth-schema.ts` |
| `sessionRelations` | `session` | `packages/db/src/auth-schema.ts` |
| `accountRelations` | `account` | `packages/db/src/auth-schema.ts` |
| `apikeyRelations` | `apikey` | `packages/db/src/auth-schema.ts` |
