# Turbo Template Copilot Instructions

> **Turbo** — A full-stack template repository with web, mobile, API, auth, and database scaffolding.

This document provides GitHub Copilot with context about the Turbo template codebase to generate consistent, high-quality code.

---

## Project Overview

Turbo is designed to help teams start new products quickly by providing:

- **Auth out of the box**: Better Auth wired into web and API
- **Database ready**: Drizzle ORM with Postgres
- **Full-stack parity**: Web, mobile, and API all share types and validators
- **Composable UI**: Shadcn/UI-based component library

---

## Monorepo Architecture

```
turbo/
├── apps/
│   ├── web/        # Next.js 16 web app (@turbo/web)
│   ├── mobile/     # Expo 54 React Native app (@turbo/mobile)
├── packages/
│   ├── analytics/  # PostHog wrapper (@turbo/analytics)
│   ├── api/        # Hono API routes (@turbo/api)
│   ├── auth/       # Better-Auth (@turbo/auth)
│   ├── db/         # Drizzle ORM + schemas (@turbo/db)
│   ├── mail/       # Resend + React Email (@turbo/mail)
│   ├── shared/     # Shared constants (@turbo/shared)
│   ├── supabase/   # Supabase client wrapper (@turbo/supabase)
│   ├── ui/         # Shadcn/UI components (@turbo/ui)
│   └── validators/ # Zod schemas (@turbo/validators)
└── tooling/        # Shared dev configs (eslint, prettier, tailwind, typescript, vitest)
```

### Key Technologies

| Layer | Technology |
|-------|------------|
| Build | Turborepo, pnpm workspaces |
| Web | Next.js 16 (App Router) |
| Mobile | Expo 54, React Native |
| API | Hono |
| Auth | Better-Auth |
| Database | Drizzle ORM + Postgres (Supabase) |
| Email | Resend + React Email |
| Styling | Tailwind CSS v4 |
| UI | Shadcn/UI |
| Analytics | PostHog |

---

## Code Style

### Functions — Always Use Arrow Functions

```typescript
// ✅ Correct
export const myFunction = (param: string) => {
  return param.toUpperCase();
};

// ❌ Incorrect
export function myFunction(param: string) {
  return param.toUpperCase();
}
```

### React Components

```tsx
// Simple component — implicit return
export const Button = ({ children }: ButtonProps) => (
  <button>{children}</button>
);

// Complex component — block body
export const Form = ({ onSubmit }: FormProps) => {
  const handleSubmit = () => { /* ... */ };
  return <form onSubmit={handleSubmit}>...</form>;
};
```

### Types

- Prefer `interface` for object shapes that might be extended
- Prefer `type` for unions, intersections, and utility types
- Use `T[]` instead of `Array<T>`

```typescript
// ✅ Correct
tags: { name: string; value: string }[]

// ❌ Incorrect
tags: Array<{ name: string; value: string }>
```

### Imports

- Use absolute imports with `@/` alias when available
- Group imports: external → internal packages → relative
- Use `type` imports for type-only imports:

```typescript
import type { ReactNode } from "react";
```

### Nullish Coalescing

**Prefer `??` over `||`** for default values:

```typescript
// ✅ Correct — only fallback on null/undefined
const name = user.name ?? "Anonymous";

// ❌ Incorrect — also fallback on "", 0, false
const name = user.name || "Anonymous";
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `email-button.tsx` |
| Components | PascalCase | `EmailButton` |
| Functions/Variables | camelCase | `sendEmail` |
| Constants | SCREAMING_SNAKE_CASE | `DEFAULT_FROM` |
| Types/Interfaces | PascalCase | `SendEmailOptions` |

### JSDoc Comments

```typescript
/**
 * Brief description of what this does.
 * @example
 * ```ts
 * await sendEmail({ to: "user@example.com" });
 * ```
 */
export const sendEmail = async (options: SendEmailOptions) => { ... };
```

---

## Styling

### Platform Stack

| Platform | Technology |
|----------|------------|
| Web | Tailwind CSS v4 |
| Mobile | Uniwind (Expo) |
| Theme | Shared `tooling/tailwind/theme.css` |

### Tailwind CSS

- Use Tailwind v4 with the shared theme from `@turbo/tailwind-config`
- Import theme in CSS: `@import "@turbo/tailwind-config/theme";`
- Use the `cn()` utility from `@turbo/ui` for conditional classes
- Design tokens are defined in `tooling/tailwind/theme.css` using OKLCH color space

### Uniwind (Mobile)

Wrap third-party components that don't support `className`:

```tsx
import { withUniwind } from "uniwind";
import { SafeAreaView } from "react-native-safe-area-context";

export const StyledSafeAreaView = withUniwind(SafeAreaView);
```

Theme switching:

```tsx
import { Uniwind, useUniwind } from "uniwind";

const { theme, hasAdaptiveThemes } = useUniwind();
Uniwind.setTheme("dark"); // "light", "dark", "system"
```

---

## Testing

### Core Philosophy

**Write tests that verify what SHOULD happen, not what DOES happen.**

Tests should be derived from **requirements and specifications**, not from examining the current implementation.

### Best Practices

1. **Document specifications in tests**:
   ```typescript
   describe("SPEC: Session Calculation", () => {
     /**
      * REQUIREMENT: "If no activity for 15 minutes, the session is considered ended"
      */
     it("gap of exactly 15 minutes should still be same session", ...);
   });
   ```

2. **Test boundary conditions explicitly**:
   ```typescript
   it("duration of 119 seconds (just under threshold) SHOULD count", ...);
   it("duration of 120 seconds (exactly at threshold) should NOT count", ...);
   ```

3. **Test names describe expected behavior**:
   ```typescript
   // ✅ Good
   it("gap of 15 min + 1ms should create a new session", ...);
   
   // ❌ Bad
   it("sessions increments when timestamp diff exceeds SESSION_GAP_MS", ...);
   ```

4. **Use constants, not magic numbers**:
   ```typescript
   // ✅ Clear
   const gap = SESSION_GAP_MS + 1;
   
   // ❌ Magic number
   const gap = 900001;
   ```

5. **When tests fail, don't automatically fix the test** — investigate if the implementation is wrong first.

---

## Analytics & Error Tracking

### PostHog Integration

| Platform | How to Track |
|----------|--------------|
| Web (Next.js) | `posthog.capture()` via `posthog-js` |
| Mobile (Expo) | `usePostHog()` from `posthog-react-native` |
| VS Code | `trackEvent()` from `./telemetry.ts` (opt-in via `turbo.enableTelemetry`) |
| API | `trackApiEvent()` from `middleware/analytics.ts` |

### What to Track

- Authentication events (login, signup, logout)
- API key creation/revocation
- Sync operations (heartbeats synced)
- Error events with context
- Feature usage (commands, settings changes)

### API Tracking Example

```typescript
import { trackApiEvent } from "../middleware/analytics";

trackApiEvent(userId, ANALYTICS_EVENTS.API_KEY_CREATED, {
  source: "dashboard",
});
```

---

## Package Conventions

### Creating New Packages

1. Create folder in `packages/<name>/`
2. Add `package.json` with `@turbo/<name>` naming
3. Add `tsconfig.json` extending `@turbo/tsconfig/compiled-package.json`
4. Add `eslint.config.ts` extending `@turbo/eslint-config/base`
5. Run `pnpm install` from root

### Dependency Rules

- **Internal packages**: Use `workspace:*`
- **Shared versions**: Use `catalog:` (from pnpm-workspace.yaml)
- **React ecosystem**: Use `catalog:react19`
- **Exact versions**: Use `-E` flag when installing

### package.json Template

```json
{
  "name": "@turbo/<name>",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./src/index.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "clean": "git clean -xdf .cache .turbo dist node_modules",
    "dev": "tsc --watch",
    "lint": "eslint",
    "typecheck": "tsc --noEmit --emitDeclarationOnly false"
  },
  "devDependencies": {
    "@turbo/eslint-config": "workspace:*",
    "@turbo/prettier-config": "workspace:*",
    "@turbo/tsconfig": "workspace:*",
    "eslint": "catalog:",
    "prettier": "catalog:",
    "typescript": "catalog:"
  },
  "prettier": "@turbo/prettier-config"
}
```

---

## Environment Variables

- Root `.env` file is shared across all apps/packages
- Use `dotenv -e ../../.env --` prefix for scripts needing env vars

### Key Variables

| Variable | Purpose |
|----------|---------|
| `POSTGRES_URL` | Database connection |
| `AUTH_SECRET` | Better-Auth secret |
| `RESEND_API_KEY` | Email service |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase client |
| `NEXT_PUBLIC_POSTHOG_KEY` | Web analytics |
| `EXPO_PUBLIC_POSTHOG_KEY` | Mobile analytics |
| `POSTHOG_API_KEY` | Server-side analytics |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or correcting tests
- `chore`: Changes to build process or auxiliary tools

### Examples

```
feat(api): add heartbeat batch sync endpoint
fix(web): resolve offline queue persistence issue
docs(readme): update installation instructions
refactor(db): migrate to Drizzle schema v2
```

---

## Documentation Guidelines

### Major Code Removals

When code is **removed entirely** (not refactored), document:

1. **What was removed** — Specific functions, files, or features deleted
2. **Why it was removed** — The reasoning behind the decision
3. **What it was replaced with** (if applicable)
4. **Impact** — Behavioral changes and affected functionality
