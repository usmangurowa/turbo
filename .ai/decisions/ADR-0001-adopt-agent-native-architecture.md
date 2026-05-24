# ADR-0001: Adopt Agent-Native Architecture

## Status
Accepted

## Context
AI coding agents (GitHub Copilot, Cursor, Codex, Claude Code, Gemini) are increasingly used for development in this repository. Without structured, machine-readable context, agents frequently:
- Invent patterns that contradict existing conventions
- Duplicate code that already exists in shared packages
- Miss required steps (e.g., exporting from barrel files, adding auth middleware)
- Create inconsistent naming or file structures

## Decision
Adopt an **agent-native architecture** where every convention, workflow, and pattern is encoded as machine-readable context in the `.ai/` directory. Specifically:

1. **`.ai/context/`** — Repository-level context (tech stack, conventions, glossary, roadmap)
2. **`.ai/skills/`** — Task-oriented step-by-step procedures for common development tasks
3. **`.ai/patterns/`** — Documented patterns (data fetching, error handling, state management)
4. **`.ai/decisions/`** — Architecture Decision Records (ADRs) for significant decisions
5. **Tool-specific wiring** — Thin config files for each tool (Copilot, Cursor, Claude, Codex) that reference `.ai/` as the source of truth
6. **Self-updating rule** — Agents must update `.ai/` files when introducing new patterns

## Consequences

### Positive
- Agents produce code consistent with existing patterns
- New team members (human or AI) onboard faster
- Conventions are documented and version-controlled
- Knowledge is not lost when it exists only in commit history

### Negative
- Maintenance overhead: `.ai/` files must stay in sync with code
- Risk of outdated documentation if the self-updating rule is not followed
- Additional files in the repository

## References
- `.ai/skills/update-ai-memory.md` — the self-updating rule
- `AGENTS.md` — universal agent instructions
