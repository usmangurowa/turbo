---
name: writing-style
description: Prose style rules for all human-facing text — READMEs, docs, PR descriptions, commit messages, progress reports, UI copy, and marketing copy. Always-on; apply to every prose output without being asked. Use explicitly when asked to write, rewrite, or review any prose.
---

# Writing Style

Rules for prose: docs, READMEs, PR descriptions, commit messages, comments, reports, and copy. They never touch code, identifiers, or technical terms. Swap in everyday words only where precision survives.

## The six rules (Orwell, 1946)

1. Never use a metaphor, simile, or other figure of speech you are used to seeing in print.
2. Never use a long word where a short one will do.
3. If it is possible to cut a word out, cut it out.
4. Never use the passive where you can use the active.
5. Never use a foreign phrase, a scientific word, or jargon if an everyday English word works.
6. Break any of these rules sooner than write anything outright barbarous.

Rule 6 is real: error messages, legal text, and API docs sometimes need the longer, exact sentence. Precision beats brevity when they conflict.

### What the rules do to a sentence

Before: "Comprehensive error handling has been implemented across all API endpoints to ensure robust and reliable performance."

After: "We added error handling to every API endpoint."

Passive turned active. 16 words down to 8. Same facts.

## Structural rules

Word rules alone don't fix AI voice. The tells are sentence shapes. Ban these:

1. **No contrast framing.** Not "It's not just X, it's Y." Not "This isn't about X — it's about Y." State the point directly.
2. **No triads.** Three parallel items in a row ("fast, reliable, and scalable") is the loudest AI tell. Use one strong item, or two, or an honest list of four.
3. **No hedged symmetry.** Not "While X is true, it's worth noting that Y." Pick the point that matters and make it.
4. **No throat-clearing openers.** Delete "It's important to note that", "In today's fast-paced world", "Let's dive in". Start with the point.
5. **No achievement language.** Delete "comprehensive", "robust", "seamless", "powerful", "leverage", "delve", "streamline", and their relatives. These are examples, not a blocklist — cut any word that praises the work instead of describing it.
6. **One em dash per paragraph, at most.** If a sentence needs two, restructure it.

## Commit messages and PR descriptions

State what changed and why, in plain words. A reviewer should know what this does in one read.

- First line: what changed. Body: why, and anything surprising.
- No achievement language. "Add retry to webhook delivery", not "Implement robust retry mechanism".
- If the change has a risk or a known gap, say so in the description. Omitting it is the worst style violation.

## Progress reports and session summaries

- Report in plain sentences: what changed, what failed, what comes next.
- No emoji checkmarks, no "Successfully", no "Perfect", no wall of bullets.
- Start with three lines; add detail only when it changes the reader's next action.
- Failures and open questions come before wins.

## Rewriting existing prose

When asked to rewrite text under these rules:

1. List each violation: stale phrase, long word (with its short replacement), cuttable words, passive constructions, banned structures.
2. Give the rewrite.
3. Keep every fact, number, and name unchanged.

For short texts (under a paragraph), skip the violation list and just rewrite.

## Marketing and landing copy

Same rules, plus the swap test: if a competitor could paste the line unchanged onto their page, rewrite or delete it. One concrete claim per line. Numbers beat adjectives.

## Precedence

- These rules govern prose only. Code, identifiers, error codes, and quoted output are exempt.
- Repo-specific voice or terminology documented elsewhere wins over these rules.
- When brevity and precision conflict, precision wins (rule 6).
