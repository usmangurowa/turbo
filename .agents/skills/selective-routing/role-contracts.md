# Role contracts

Exact prompt and report contracts for selective-routing sub-agents. Adapt every
placeholder without removing a required field.

## Shared implementation contract

Every implementer prompt (bounded or high-risk lane) must contain all five sections
plus the return contract:

~~~text
OBJECTIVE
<Observable outcome and why it matters.>

FILES AND OWNERSHIP
You own only:
- <exact file or module>

You are not alone in the codebase. The user or other agents may be editing
concurrently. Preserve their edits, do not revert unrelated work, and adapt to
changes already present. Do not modify files outside your ownership.

INTERFACES
- <Signatures, types, schemas, commands, or behavior that must remain compatible.>

CONSTRAINTS
- Follow AGENTS.md, .ai/context/conventions.md, and <matching .ai/skills/ file>.
- <Safety boundaries, excluded scope, and settled decisions.>

VERIFICATION
- Run: <exact command>
  Success: <concrete expected result>
- Inspect: <exact file, diff, or generated artifact>
  Success: <concrete expected evidence>

RETURN
Return exact commands and actual evidence. A completion claim without evidence is
invalid. End with:

IMPLEMENTATION REPORT
STATUS: complete | partial | blocked
OBJECTIVE: <one-line restatement>
CHANGES: <file-by-file summary from the actual diff>
VERIFIED: <exact commands plus concrete output evidence>
JUDGMENT CALLS: <decisions the specification left open, or none>
GAPS: <unfinished work, ambiguity, or none>
~~~

The primary session must inspect the diff and rerun verification itself.

## Bounded implementer lane

Only when a declared `delegate` or `full` route selects it for bounded, fully
specified work.

Spawn via the `task` tool:

~~~text
agent_type: general-purpose
mode: sync
model: gpt-5.6-luna          # if available; otherwise omit
reasoning_effort: max        # only with the model override
~~~

Prompt prefix:

~~~text
ROLE
Act as the routine implementation worker. Execute the supplied specification within
the settled architecture, preserve every stated interface and constraint, and surface
ambiguity instead of redesigning the architecture.

<paste and complete the Shared implementation contract>
~~~

If the first result reveals newly observed judgment-heavy, high-risk,
wide-blast-radius, or misclassified work, declare an escalation to the high-risk
lane. If the specification itself was incomplete or wrong, return a precise
correction for one corrected bounded attempt; that retry is not a prerequisite for
escalation.

## High-risk implementer lane

Only when a declared `delegate` or `full` route selects judgment-heavy, high-risk,
context-heavy, or wide-blast-radius work, including risk revealed by a first
bounded-lane result.

Spawn via the `task` tool:

~~~text
agent_type: general-purpose
mode: sync
model: gpt-5.6-terra         # if available; otherwise use the strongest available
reasoning_effort: high
~~~

Prompt prefix:

~~~text
ROLE
Act as the high-complexity escalation worker. Resolve the supplied specification
within the settled architecture, preserve every stated interface and constraint, and
surface ambiguity instead of redesigning the architecture.

<paste and complete the Shared implementation contract>
~~~

## Fresh reviewer lane

Only for an `audit` or `full` route, after the primary session has verified the work
itself. Spawn a new reviewer with fresh context:

~~~text
agent_type: code-review
mode: sync
model: gpt-5.6-sol           # if available; otherwise use the strongest available
reasoning_effort: high
~~~

The `code-review` agent type is read-only by design; the prompt additionally forbids
edits. If any mutation is observed after the review, stop the lane, report it, and
do not hide or repair the mutation under that verdict.

Prompt:

~~~text
ROLE
Act as the fresh final reviewer. Remain strictly read-only: do not edit files,
implement fixes, or broaden scope.

STATED GOAL
<The user's requested outcome.>

ACCUMULATED CHANGE SET
<Exact allowed files plus how to view the complete working-tree diff, or explicit
base/head revisions.>

INTERFACES AND CONSTRAINTS
- <Compatibility, repository rules, safety boundaries, and excluded scope.>

VERIFICATION EVIDENCE
- <command> -> <actual primary-session output evidence>
- <artifact or diff inspection> -> <actual evidence>

REVIEW
Inspect the actual files and accumulated change set. Judge correctness, completeness,
regressions, scope discipline, interface preservation, test adequacy, and material
risk. End with:

REVIEW VERDICT
VERDICT: ship | fix-first | rethink
REASON: <decisive evidence-based reason>
FINDINGS: <precise file references and required fixes, or none>
RESIDUAL RISK: <most important remaining risk, or none>
~~~

If any fix is made after review, discard the verdict and run a new fresh review.
A same-model reviewer is context-clean, not cross-model-family independence.

## Exact mode contracts

- `solo`: the primary session plans, implements, tests, and self-reviews. Spawn no
  auxiliary.
- `delegate`: one selected implementer executes the complete five-part
  specification. The primary session verifies. Do not spawn a fresh reviewer.
- `audit`: the primary session implements and verifies. A fresh read-only reviewer
  inspects the accumulated diff. Spawn no implementer. On `fix-first`, the primary
  session implements the correction, re-verifies, and obtains a new fresh reviewer.
- `full`: only for an explicit broad or high-risk exception. One selected
  implementer executes the specification, the primary session verifies, and a fresh
  read-only reviewer inspects the accumulated diff. On `fix-first`, the selected
  implementer handles the correction, the primary session re-verifies, and a new
  fresh reviewer inspects the result.

Auxiliary work substitutes for primary-session work; it must not duplicate it. A
route can escalate only with newly observed, recorded risk; it never silently
downgrades. Solo and delegate get no fresh reviewer unless a newly observed,
risk-evidenced escalation is declared; never silently add one.
