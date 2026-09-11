# Pattern: External Data Provider Boundary

## Overview

When a feature needs data from an external API (identity lookups, reference
data, pricing, geocoding), wrap it in a dedicated, narrow provider module
rather than calling `fetch` from a router or domain function directly. The
module owns config, the request, error classification, and normalization for
one provider — nothing else. Persistence, caching, and fallbacks belong to the
caller in the domain layer.

## Where it lives

- `packages/api/src/domain/<provider>/<provider>.ts` — one file per provider.
- The domain function that consumes it (for example a search or sync
  orchestrator) merges provider data with whatever already works locally and
  owns caching and upserts.

## Shape of the boundary module

1. **Config function returns `null` or a typed config object, never throws.**
   Read env vars once; return `null` only for an explicit disable switch.
   Most free APIs need no key, so "unconfigured" and "no key" are different
   states — do not conflate them.
2. **One function per capability, typed input and output, no DB access.** The
   provider module never touches Drizzle; it returns plain data.
3. **A 10s `AbortController` timeout on every external fetch:**

   ```ts
   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), 10_000);
   try {
     response = await fetch(url, { signal: controller.signal });
   } catch {
     return { status: "unavailable" as const };
   } finally {
     clearTimeout(timeout);
   }
   ```

4. **Every failure mode collapses to one typed "unavailable" result** — 429,
   network error, timeout, non-2xx, and malformed JSON all return the same
   shape. Callers never see a thrown error and never need provider-specific
   error handling.
5. **Defensive response parsing.** Treat provider JSON as untrusted: check
   `Array.isArray`, verify each field's primitive type, and drop (never crash
   on) a malformed row.
6. **Never log secrets.** An API key goes in a request header only — never
   into a log line or error message.
7. **The caller owns caching, debounce, and the "local data stays usable"
   guarantee.** The provider module has no cache; the orchestrator decides
   eligibility (minimum query length, feature flags), caches results (an
   in-memory TTL map is fine for a single-instance deployment), and merges
   provider data with local data so an outage degrades instead of breaking
   the feature.
8. **An emergency env-var kill switch** (for example `<PROVIDER>_DISABLED=1`)
   forces the "unavailable" path without a deploy.

## Testing

- Provider module: `vi.stubGlobal("fetch", ...)` and cover success, 429,
  network error, 5xx, and malformed-body cases, plus that the API key header
  is present only when configured.
- Orchestrator: integration-test merge, caching, and upsert behaviour against
  a real test database with a stubbed provider response.

## Anti-patterns

- Do not call `fetch` for an external provider directly from a router handler.
- Do not let a provider outage throw or 5xx to the client; it must degrade to
  a typed "unavailable" status.
- Do not treat a free API's optional key as a hard "unconfigured" gate — most
  work unauthenticated at a lower rate limit.
- Do not invent data the provider did not return — use an honest sentinel and
  say so in the UI.
