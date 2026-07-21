# GitHub Copilot Instructions

> Short task-trigger map. Full procedures live in `.ai/skills/`.

## Before any task

Read `AGENTS.md`, `.ai/context/tech-stack.md`, `.ai/context/conventions.md`, `ARCHITECTURE.md`, and `ROADMAP_AI.md`.

For non-trivial work or changes touching more than three implementation files, read `.ai/skills/feature-spec.md` and create/update a spec in `.ai/specs/active/` before editing code.

## Task → Skill mapping

| When the user says...    | Read this skill                     |
| ------------------------ | ----------------------------------- |
| "set up this project"    | `.ai/skills/setup-project.md`       |
| "create a component"     | `.ai/skills/create-component.md`    |
| "create a package"       | `.ai/skills/create-package.md`      |
| "add an endpoint"        | `.ai/skills/create-api-endpoint.md` |
| "change database schema" | `.ai/skills/database-change.md`     |
| "create a page"          | `.ai/skills/create-page.md`         |
| "review the UI"          | `.ai/skills/anti-slop-ui.md`        |
| "write tests"            | `.ai/skills/write-tests.md`         |
| "review this"            | `.ai/skills/code-review.md`         |
| "fix this error"         | `.ai/skills/debug-failure.md`       |
| "refactor"               | `.ai/skills/refactor.md`            |
| "plan a feature"         | `.ai/skills/feature-spec.md`        |

If no exact skill matches a task, use the closest skill and follow `.ai/context/conventions.md`.

## Self-Updating Rule

If your task introduces a new pattern, convention, or dependency, update the relevant `.ai/` files in the same PR. See `.ai/skills/update-ai-memory.md`.

Before completing any task, complete the `update-ai-memory` checklist and update `.ai/` files when required.

## Key patterns

- Components: CVA + cn() + data-slot (see `packages/ui/src/components/button.tsx`)
- API: Hono routers in `packages/api/src/router/`
- DB: Drizzle schemas in `packages/db/src/`
- Tests: Vitest in `__tests__/*.test.ts`
- Contracts: generated snapshots in `.ai/contracts/*.generated.md`

---

## Agent Skills

This repository ships reusable agent skills in `.agents/skills/` (symlinked into `.claude/skills/` and `.github/skills/`). Each skill is a folder with a `SKILL.md` describing when and how to apply it. **At the start of any task, check whether one of these skills matches the work and read its `SKILL.md` before proceeding.**

| Skill | Use when |
| ----- | -------- |
| `brainstorming` | Before any creative work — new features, components, or behavior changes. Explore intent, requirements, and design before implementation. |
| `write-a-prd` | Turning a client brief or request into a structured PRD in `issues/`. |
| `grill-me` | A relentless interview to sharpen a plan or design before building. |
| `tdd` | Building features or fixing bugs test-first with a red-green-refactor loop. |
| `improve-codebase-architecture` | Finding refactoring opportunities and deepening shallow modules to improve testability. |
| `to-tickets` | Breaking a plan, spec, or conversation into tracer-bullet tickets with blocking edges. |
| `teach` | Teaching the user a new skill or concept within this workspace. |
| `remotion-best-practices` | Any work involving Remotion video composition. |
| `reddit-automation` | Automating Reddit workflows (posting, scraping, engagement). |
| `find-skills` | The user asks "how do I do X" or wants to discover/install new agent skills. |
| `codebase-first` | ALWAYS-ON for any code change: the codebase decides, never invent — follow documented rules and existing patterns, ask when neither exists. |
| `shadcn` | Any shadcn/ui work: adding, composing, styling, or debugging components via the shadcn CLI and registry. |
| `writing-style` | Always-on for prose: READMEs, docs, PR descriptions, commit messages, reports, UI and marketing copy. |

Skill workflow rules:

- `writing-style` is always-on: apply its prose rules to every README, doc, PR description, commit message, and report without being asked.
- `codebase-first` is always-on for code: before writing any code, follow its checklist — documented rules and existing patterns decide everything; never invent, ask when neither exists.
- Skills marked "use when" are auto-applicable: if the task matches, follow the skill — do not wait to be asked.
- `brainstorming` and `tdd` are default workflows for feature work: brainstorm before designing, TDD while implementing, unless the user explicitly opts out.
- When a skill conflicts with repo conventions documented elsewhere in this file, repo conventions win.

---

## Marketing Skills

This repository also ships the full [coreyhaines31/marketingskills](https://skills.sh/coreyhaines31/marketingskills) pack in `.agents/skills/` (symlinked into `.claude/skills/` and `.github/skills/`). Use these whenever the task is marketing-related rather than engineering-related.

Start here:

- `product-marketing-context` — run this FIRST for any marketing work: it reads the codebase/product and produces the positioning, ICP, and messaging context the other skills consume.

Then pick the matching skill, e.g.: `copywriting`, `copy-editing`, `social`, `ad-creative`, `ads`, `emails`, `cold-email`, `launch`, `landing-pages` (via `cro`), `seo-audit`, `ai-seo`, `programmatic-seo`, `schema`, `content-strategy`, `marketing-ideas`, `marketing-psychology`, `image`, `video`, `analytics`, `ab-testing`, `pricing`, `paywalls`, `onboarding`, `referrals`, `churn-prevention`, `competitor-profiling`, `competitors`, `customer-research`, `positioning`, `messaging`, and more — each skill's `SKILL.md` frontmatter describes exactly when to use it.

Rules:

- For flyers/graphics use `image`; for promo videos use `video`; for social posts use `social`; for ad copy use `ad-creative`.
- Always ground marketing output in `product-marketing-context` results so copy reflects what the product actually does.
