# AI Agent Memory

This directory is the **source of truth** for all AI coding agents working in this repository (GitHub Copilot, Cursor, Codex, Claude Code, Gemini, Jules).

## Structure

| Path          | Purpose                                                                       |
| ------------- | ----------------------------------------------------------------------------- |
| `context/`    | Repository-level context: tech stack, conventions, glossary, roadmap          |
| `skills/`     | Step-by-step procedures for common tasks (create component, write test, etc.) |
| `patterns/`   | Documented patterns: data fetching, error handling, state management          |
| `decisions/`  | Architecture Decision Records (ADRs)                                          |
| `contracts/`  | Generated snapshots of API, DB, env, package exports, and dependency graph    |
| `references/` | Vendored external references used by repo-local skills                        |
| `specs/`      | Spec-first plans for non-trivial work                                         |

## How agents consume this

1. **Before any task**, read `../AGENTS.md`, `context/tech-stack.md`, `context/conventions.md`, and the matching skill file.
2. **Before non-trivial work**, read `../ARCHITECTURE.md`, `../ROADMAP_AI.md`, and create/update a spec with `skills/feature-spec.md`.
3. **During the task**, follow the step-by-step procedure in the skill file.
4. **After the task**, if you introduced a new pattern or convention, update the relevant files here in the **same PR**.
5. **After contract changes**, run `pnpm ai:contracts` and commit the generated snapshots.

## Cross-tool wiring

Tool-specific config files (`.github/copilot-instructions.md`, `.cursor/rules/*.mdc`, `.claude/commands/*.md`) are **thin wrappers** that reference files in this directory. Do **not** duplicate content — link here instead.

## Existing skills (in `.agents/skills/`)

The repository also maintains tool-specific skill bundles in `.agents/skills/`. Those contain deep reference material per technology. The files in `.ai/skills/` are **task-oriented procedures** that complement those references.
