# Claude Code Instructions

See `AGENTS.md` for universal agent rules and `.ai/skills/` for task-specific procedures.

## Quick Start

1. Read `AGENTS.md` before starting any task.
2. Find the matching skill in `.ai/skills/00-index.md`.
3. Read `ARCHITECTURE.md` and `ROADMAP_AI.md` before writing code.
4. Follow the step-by-step procedure in the skill file.
5. For non-trivial work, create/update a spec with `.ai/skills/feature-spec.md`.
6. Update `.ai/` files if you introduce new patterns (see `.ai/skills/update-ai-memory.md`).

## Commands

- `.claude/commands/commit.md` — Generate a commit message
- `.claude/commands/new-package.md` — Scaffold a new package
- `.claude/commands/review.md` — Review code changes
- `pnpm ai:contracts` — Refresh generated AI contract snapshots

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
| `writing-style` | Always-on for prose: READMEs, docs, PR descriptions, commit messages, reports, UI and marketing copy. |

Skill workflow rules:

- `writing-style` is always-on: apply its prose rules to every README, doc, PR description, commit message, and report without being asked.
- Skills marked "use when" are auto-applicable: if the task matches, follow the skill — do not wait to be asked.
- `brainstorming` and `tdd` are default workflows for feature work: brainstorm before designing, TDD while implementing, unless the user explicitly opts out.
- When a skill conflicts with repo conventions documented elsewhere in this file, repo conventions win.
