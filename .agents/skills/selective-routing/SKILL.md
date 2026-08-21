---
name: selective-routing
description: "Risk-gated agent orchestration: declare a route (solo, delegate, audit, or full) before spawning any sub-agent. Default is solo. Use for multi-file features, high-risk changes, or any work where delegation or an independent review is on the table. Adapted from DannyMac180/sol-advisor for Copilot CLI."
---

# Selective Routing

Act as the architect. You own the user's intent, the architecture, the route choice,
decomposition, implementation or delegation, verification of every sub-agent's work,
and final acceptance. Sub-agents substitute for your work; they never replace your
judgment.

Selective routing has four exact modes: `solo`, `delegate`, `audit`, and `full`.
Solo is the default. One auxiliary sub-agent is the default maximum; `full` is an
explicit broad or high-risk exception.

Read [role-contracts.md](role-contracts.md) before the first delegation — it defines
the exact prompts and report formats for implementers and reviewers.

## Declare the route before any sub-agent

Before the first `task` tool call, emit one machine-auditable declaration in your
response:

~~~text
SELECTIVE ROUTE
mode: solo | delegate | audit | full
risk: <concise, task-specific rationale>
~~~

No sub-agent may be spawned before this declaration. Choose `solo` unless a stated
risk justifies another mode. A later declaration may only **escalate** the route when
newly observed risk justifies it — record the evidence. Never silently downgrade.

## The four routes

| Mode | Use it when | Delivery |
|---|---|---|
| `solo` | Default; risk is contained. | You plan, implement, test, and self-review. Spawn nothing. |
| `delegate` | A complete spec is better executed by one implementer. | One implementer sub-agent executes the full spec; you verify. No reviewer. |
| `audit` | Independent final scrutiny matters more than delegation. | You implement and verify; a fresh read-only reviewer inspects the diff. No implementer. |
| `full` | Explicit broad or high-risk exception. | One implementer, your verification, then a fresh read-only reviewer. |

## Implementer lanes (delegate and full)

Spawn one implementer via the `task` tool with `agent_type: general-purpose`,
`mode: sync`, and a complete five-part specification (see role-contracts.md):

- **Bounded lane** — bounded, fully specified, routine work. Prefer
  `model: gpt-5.6-luna`, `reasoning_effort: max` when available; otherwise use the
  default model.
- **High-risk lane** — judgment-heavy, high-risk, context-heavy, or
  wide-blast-radius work. Prefer `model: gpt-5.6-terra`, `reasoning_effort: high`
  when available; otherwise use the strongest available model.

A first bounded-lane result that reveals newly observed complexity, risk, wide blast
radius, or misclassification may justify a declared escalation to the high-risk lane;
do not force a retry first. A corrected bounded-lane attempt is reserved for a
specification error and is not a prerequisite for escalation.

## Reviewer lane (audit and full)

Only after you have verified the work yourself, spawn a fresh reviewer via the
`task` tool with `agent_type: code-review` (read-only by design), `mode: sync`.
Prefer `model: gpt-5.6-sol`, `reasoning_effort: high` when available. The reviewer:

- inspects the actual accumulated diff, never a summary alone;
- returns exactly one verdict: `ship`, `fix-first`, or `rethink`;
- never implements fixes itself.

Verdict handling:

- **ship** — report completion with the verification evidence.
- **fix-first** — in `audit`, you implement the correction; in `full`, the selected
  implementer does. Either way: re-verify, then obtain a *new* fresh reviewer. Any
  fix invalidates the prior verdict.
- **rethink** — revise the architecture; do not report completion.

`solo` and `delegate` do not get a fresh reviewer unless a newly observed,
risk-evidenced escalation is declared.

## Keep architect work in the primary session

Never delegate these:

- Resolving requirements and material ambiguity (ask the user).
- Choosing architecture, interfaces, decomposition, and the route.
- Writing the complete five-part worker specification.
- Inspecting the actual diff and rerunning verification commands yourself.
- Deciding whether newly observed risk warrants escalation.
- Judging the reviewer verdict and accepting the deliverable.

## Treat worker reports as claims

A sub-agent's completion claim without evidence is invalid. In the primary session,
always confirm:

1. the complete diff (`git --no-pager diff` / `git status`) and that changed files
   match the declared ownership;
2. the requested verification commands, rerun by you, with the expected results;
3. that concurrent edits by the user or other agents were preserved, not reverted.

Do not duplicate the implementer's work — verify it.

## Repo integration

- Workers must follow this repo's rules: `AGENTS.md`, `.ai/context/conventions.md`,
  and the matching `.ai/skills/` file. Reference them in the CONSTRAINTS section of
  every worker spec.
- Verification commands should be the smallest targeted ones the repo defines
  (Vitest via `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm ai:contracts` after
  contract-affecting changes).
- This skill governs *whether and how* to spawn sub-agents; `tdd`, `codebase-first`,
  and the `.ai/skills/` procedures govern the implementation itself.
