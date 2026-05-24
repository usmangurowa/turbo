# Skill: Create API Endpoint

## When to use

"Add an endpoint", "create an API route", "add a new route handler".

## Prerequisite context to load

- `.ai/context/conventions.md` — API patterns
- `packages/api/src/index.ts` — app setup with route registration
- `packages/api/src/router/api-key.ts` — reference router
- `packages/api/src/context.ts` — context types

## Inputs required from user

- Route path (e.g., `/users`, `/products/:id`)
- HTTP methods needed
- Whether authentication is required
- Request/response schema
- If any required input is missing or ambiguous, ask before creating/editing files.

## Step-by-step procedure

1. Create a new router file: `packages/api/src/router/<name>.ts`
2. Follow this pattern:

   ```typescript
   import { Hono } from "hono";

   import type { AppContext } from "../context";
   import { authMiddleware } from "../middleware/auth";

   const app = new Hono<AppContext>()
     .use("*", authMiddleware) // if auth required
     .get("/", (c) => {
       // handler
       return c.json({ data: [] });
     });

   export default app;
   ```

3. Register the router in `packages/api/src/index.ts`:
   ```typescript
   import newRouter from "./router/<name>";
   // Add to the app chain:
   .route("/<name>", newRouter)
   ```
4. Add Zod validation schemas in `packages/validators/` if needed.
5. The typed client (`hcWithType`) will automatically pick up the new routes.

## Canonical example

`packages/api/src/router/api-key.ts` — demonstrates auth middleware, CRUD operations, and typed responses.

## Validation checklist

- [ ] Router file is in `packages/api/src/router/`
- [ ] Uses `Hono<AppContext>` for type-safe context
- [ ] Auth middleware applied if endpoint is protected
- [ ] Route registered in `packages/api/src/index.ts`
- [ ] Response types are explicit
- [ ] `pnpm typecheck --filter=@turbo/api` passes

## Anti-patterns (do NOT do)

- Do not create API routes directly in `apps/web/src/app/api/` for business logic — use `packages/api/`
- Do not skip the `AppContext` type parameter
- Do not return untyped responses
- Do not forget to register the router in the main app
