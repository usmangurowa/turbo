# Skill: Project Setup (First-Time)

## When to use

"Set up this project", "initialize the template", "rebrand this codebase", "first-time setup", "make this template mine" — right after cloning the template, before any feature work.

## Prerequisite context to load

- `.ai/context/conventions.md` — non-secret constants are hardcoded, not stored in `.env`
- `apps/mobile/app.config.ts` — Expo identity constants
- `.env.example` — required environment variables

## Inputs required from user

Ask for each value one at a time. Offer the current value as the default so the user can skip what they don't have yet.

| # | Input | Example | Notes |
| - | ----- | ------- | ----- |
| 1 | App display name | `Acme` | Used for mobile app name and web titles |
| 2 | App slug | `acme` | Lowercase, no spaces; Expo project slug |
| 3 | Deep-link scheme | `acme` | Usually same as slug |
| 4 | Bundle/package ID | `com.acme.app` | Reverse-DNS; dev/preview variants are derived (`com.acme.dev`, `com.acme.preview`) |
| 5 | Expo owner | `acme-team` | Expo account username or org |
| 6 | EAS project ID | UUID from expo.dev | Skippable; leave placeholder if not created yet |
| 7 | Production web domain | `https://acme.com` | Drives web metadata and email addresses |
| 8 | Twitter/X handle | `@acme` | Skippable |
| 9 | PostHog host | `https://us.i.posthog.com` | Only change if on EU cloud (`https://eu.i.posthog.com`) or self-hosted |
| 10 | Trigger.dev project ID | `proj_...` | Skippable if not using background jobs |

## Step-by-step procedure

1. Collect the inputs above (one question at a time, defaults offered).
2. Apply each value to its locations:

   | Value | Locations |
   | ----- | --------- |
   | App display name | `apps/mobile/app.config.ts` (`APP_NAME` fallback) · `apps/mobile/eas.json` (`EXPO_PUBLIC_APP_NAME` in every profile: `Name (Dev)`, `Name (Preview)`, `Name`) · `apps/web/src/app/layout.tsx` (`title`, `openGraph.title`, `siteName`) |
   | App slug | `apps/mobile/app.config.ts` (`APP_SLUG`) |
   | Scheme | `apps/mobile/app.config.ts` (`APP_SCHEME`) · `apps/mobile/src/utils/auth.ts` (fallback scheme) |
   | Bundle/package ID | `apps/mobile/app.config.ts` (`PACKAGE_NAME` fallback = `<id>` prod) · `apps/mobile/eas.json` (`EXPO_PUBLIC_PACKAGE_NAME`: `<base>.dev` in dev profiles, `<base>.preview` in preview profiles, `<id>` in production) |
   | Expo owner | `apps/mobile/app.config.ts` (`OWNER`) |
   | EAS project ID | `apps/mobile/app.config.ts` (`EAS_PROJECT_ID`) |
   | Web domain | `apps/web/src/app/layout.tsx` (`metadataBase`, `openGraph.url`) · `packages/mail/src/client.tsx` (`DEFAULT_FROM` = `no-reply@<domain>`, default support `to` = `support@<domain>`) · `packages/mail/src/templates/welcome.tsx` (default `actionUrl`) |
   | Twitter handle | `apps/web/src/app/layout.tsx` (`twitter.site`, `twitter.creator`) |
   | PostHog host | `packages/shared/src/constants.ts` (`POSTHOG_HOST`) |
   | Trigger.dev project ID | `packages/jobs/trigger.config.ts` (`project`) |

3. Also update descriptive copy: `apps/web/src/app/layout.tsx` `description`/`openGraph.description` if the user provides a tagline (skippable).
4. Environment file: if `.env` does not exist, copy `.env.example` to `.env` and tell the user which secrets to fill (`POSTGRES_URL`, `AUTH_SECRET` via `openssl rand -base64 32`, `RESEND_API_KEY`, provider keys). Never write real secrets into `.env.example`.
5. Verify:
   - `cd apps/mobile && npx expo config --json` resolves with the new name/slug/owner/bundle ID
   - `pnpm turbo typecheck lint -F @turbo/mobile -F @turbo/web -F @turbo/shared -F @turbo/mail -F @turbo/jobs --output-logs=errors-only`
   - `pnpm ai:context` to refresh generated contracts
6. Summarize what was changed and what was skipped (with placeholders remaining) so the user can finish later.

## Validation checklist

- [ ] All provided values applied to every location in the table
- [ ] eas.json dev/preview/production variants derived correctly from the base bundle ID
- [ ] `expo config` resolves without errors
- [ ] Typecheck and lint pass for touched packages
- [ ] `.env` created (if missing) and required secrets listed for the user
- [ ] Skipped values reported back with their file locations

## Anti-patterns (do NOT do)

- Do not rename the `@turbo/*` package scope — internal package names are not user-facing identity
- Do not edit `apps/mobile/ios/` or `apps/mobile/android/` native folders directly; `expo prebuild` regenerates them from `app.config.ts`
- Do not put non-secret constants back into `.env` — they are hardcoded by convention
- Do not commit `.env` or write secrets into tracked files
- Do not guess values the user skipped — leave the existing placeholder and report it
