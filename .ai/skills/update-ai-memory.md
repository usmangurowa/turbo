# Skill: Update AI Memory

## When to use
After **any** task that introduces a new pattern, convention, dependency, or architectural decision not already documented in `.ai/`.

> **This is mandatory.** Every AI agent working in this repo MUST follow this procedure.

## Prerequisite context to load
- `AGENTS.md` — universal rules
- `.ai/context/conventions.md` — current conventions
- `.ai/context/tech-stack.md` — current tech stack
- `.ai/skills/00-index.md` — current skills index

## Inputs required from user
- None. The agent determines whether AI memory needs updating based on the work performed.

## Step-by-step procedure

### Before starting any task
1. Read `AGENTS.md`.
2. Read `.ai/context/tech-stack.md` and `.ai/context/conventions.md`.
3. Read the matching skill file in `.ai/skills/` for the current task.

### After completing the task
4. **Evaluate**: Did this task introduce any of the following?
   - A new code pattern not documented in `.ai/patterns/`
   - A new convention not documented in `.ai/context/conventions.md`
   - A new dependency not listed in `.ai/context/tech-stack.md`
   - An architectural decision worth recording
5. **If yes**, in the **same PR**:
   - Add or update files under `.ai/skills/`, `.ai/patterns/`, or `.ai/decisions/`
   - Update `.ai/context/conventions.md` if a convention changed
   - Update `.ai/context/tech-stack.md` if a dependency was added/removed
   - Update `.ai/skills/00-index.md` if a new skill was added
6. **If an existing skill is outdated** or contradicted by new code, update the skill.

### What to create
- **New pattern** → `.ai/patterns/<name>.md`
- **New skill** → `.ai/skills/<name>.md` (follow the skill template)
- **Architectural decision** → `.ai/decisions/ADR-NNNN-<title>.md` (use ADR template)

## Canonical example
This file itself — `.ai/skills/update-ai-memory.md` — is an example of a skill file.

## Validation checklist
- [ ] All new patterns are documented
- [ ] All changed conventions are reflected in `.ai/context/conventions.md`
- [ ] New dependencies are listed in `.ai/context/tech-stack.md`
- [ ] New skills are indexed in `.ai/skills/00-index.md`
- [ ] No existing skill contradicts the new code

## Anti-patterns (do NOT do)
- Do not skip this step — it is the most important skill
- Do not create a separate PR for AI memory updates — include them in the same PR
- Do not duplicate content — reference existing files
- Do not invent patterns that were not actually implemented
