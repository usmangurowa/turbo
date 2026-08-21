# ADR-0002: Adopt Selective Routing for Sub-Agent Orchestration

## Status

Accepted

## Context

Agents in this repository can spawn sub-agents (implementers, reviewers) via task
tools. Without a policy, agents tend to over-delegate — spawning multiple sub-agents
for work the primary session could do directly — and to accept sub-agent completion
claims without verifying the actual diff. The [sol-advisor](https://github.com/DannyMac180/sol-advisor)
project encodes a disciplined alternative as a Codex CLI plugin, but its plugin
format, installer, and model-pinning mechanism are Codex-specific.

## Decision

Port the sol-advisor *process contract* (not the plugin) as the `selective-routing`
agent skill in `.agents/skills/selective-routing/`:

- Four explicit routes — `solo` (default), `delegate`, `audit`, `full` — declared in
  a machine-auditable `SELECTIVE ROUTE` block before any sub-agent is spawned.
- Routes may only escalate on newly observed, recorded risk; never silently
  downgrade.
- Implementer prompts use a mandatory five-part specification (OBJECTIVE, FILES AND
  OWNERSHIP, INTERFACES, CONSTRAINTS, VERIFICATION) and a structured report.
- Sub-agent reports are claims: the primary session inspects the diff and reruns
  verification itself.
- Reviews (audit/full only) come from a fresh read-only reviewer returning exactly
  `ship`, `fix-first`, or `rethink`; any fix invalidates the prior verdict.
- Codex-specific machinery (agent TOMLs, fail-closed installer, sandbox
  verification) is replaced with Copilot CLI `task` tool spawns: `general-purpose`
  implementers with optional `gpt-5.6-luna`/`gpt-5.6-terra` model overrides and a
  `code-review` (read-only) reviewer, degrading gracefully when those models are
  unavailable.

## Consequences

### Positive

- Solo-by-default counters reflexive multi-agent spawning and its cost/latency.
- Route declarations make delegation decisions auditable in session transcripts.
- Diff-level verification catches incomplete or scope-widening sub-agent work.
- The skill is markdown-only and portable across Claude Code, Copilot, and Codex.

### Negative

- Adds ceremony to tasks that legitimately need quick delegation.
- Model-pinned lanes (Luna/Terra/Sol) are advisory, not enforced, outside hosts
  that expose those models.

## References

- `.agents/skills/selective-routing/SKILL.md`
- Upstream: https://github.com/DannyMac180/sol-advisor
