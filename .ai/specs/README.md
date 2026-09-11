# Specs

Feature specs live here. `_template.spec.md` is the starting point; the
procedure is `.ai/skills/feature-spec.md`.

## Lifecycle

- `active/` — specs for work that is in flight or whose decisions still
  constrain new code (for example an architecture spec agents must follow).
  A finished spec stays here with `State: implemented` as the decision
  record.
- `archive/` — specs whose work shipped and whose content is fully reflected
  in code and `.ai/` docs, so no future decision needs them. Create the folder
  on first use.

## Archival rule

Mark a spec `State: implemented` (or `shipped`) in the PR that finishes the
work. Move it to `archive/` only once agents no longer need it to make correct
decisions; note why at the top of a spec that must stay in `active/`. Never
delete specs — they are the decision record.
