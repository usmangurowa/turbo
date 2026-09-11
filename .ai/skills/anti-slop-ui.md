# Skill: Anti-Slop UI

## When to use

Use for tasks such as "review the UI", "polish this page", "make this feel premium", "design a landing page", "avoid AI slop", or any broad visual refinement of a web surface.

This skill is a repo-local adaptation of anti-slop UI principles. It is a quality bar for composition and execution, not permission to override user direction or the repository's neutral product baseline.

## Prerequisite context to load

- `.ai/references/pols-anti-slop-design-law.md` — full external design law for broad UI work
- `DESIGN.md` — canonical design language and token mirror
- `.ai/context/design-system.md` — repository visual baseline and token rules
- `.ai/patterns/ui-composition.md` — composition and layout boundaries
- `.ai/context/conventions.md` — shared coding conventions
- The owning route or component files for the surface being changed

## Inputs required from user

- The target screen, page, or component
- Whether the surface should stay product-neutral or become more expressive
- Any explicit brand, palette, type, motion, or content constraints

If the task would materially change brand direction, palette, or typography and the user has not asked for that, ask first.

## Step-by-step procedure

### 1. Classify the surface

1. Decide whether the work is a dense product workflow, a mixed product/marketing surface, or a brand-forward landing page.
2. Preserve the mature shadcn-style baseline for product workflows unless the user explicitly requests a broader visual shift.

### 2. Respect repo and user constraints

1. User direction wins over this skill.
2. Inspect the nearest existing route and component before designing. Follow
   its information hierarchy, action placement, responsive behavior, and
   state handling when they fit the requested workflow. Name the inspected
   precedent in the feature spec, design note, or working context before
   editing so the choice is explicit and reviewable.
3. Use the configured shadcn primitive and verify unfamiliar compositions
   against current shadcn documentation before creating a custom interaction.
4. Preserve shared theme tokens, spacing discipline, and existing component conventions.
5. Do not introduce a broad palette or typography change without approval.
6. Follow the slot, accessibility, page, and state productions in
   `.ai/patterns/ui-composition.md`.

### 3. Remove default AI-looking patterns

Avoid defaulting to these patterns unless the user explicitly asks for them and they truly fit the surface:

- Blue-purple or candy gradients as the main visual identity
- Glowy pill buttons or generic fill-plus-outline CTA pairs
- Oversized icons inside colored tiles
- Fake app windows, fake dashboards, or placeholder product props
- Decorative-only floating cards, chips, quote blocks, or testimonial filler
- Recycled split heroes with a text stack on one side and a generic panel on the other
- Entrance animations that hide content until motion completes

### 4. Build around one clear idea

1. Pick one signature visual decision for expressive surfaces instead of stacking many effects.
2. Keep the rest of the page restrained and coherent around that one idea.
3. Prefer real product content, real data, or meaningful imagery over generic placeholders.
4. Use prebuilt primitives for behavior and accessibility, then art-direct the styling for the task.

### 5. Protect execution quality

1. Content must be visible by default, even if motion does not run.
2. Text must not be clipped by masks, overflow, fixed heights, or decorative cuts.
3. Repeated comparison blocks must align across columns, especially CTAs.
4. Text needs clear gutters from edges and sufficient contrast on every surface.
5. Icons, labels, counters, and badges must be actually centered, not approximately centered.
6. Any control that looks interactive must function in the browser.

### 6. Use motion and depth deliberately

1. Prefer purposeful motion over decorative hover-lift or glow.
2. Keep shadows tight, directional, and surface-aware; avoid soft all-around bloom.
3. Avoid clipped glows, fake shadow boxes, and motion that exists only to add noise.
4. Respect `prefers-reduced-motion` for non-essential animation.

### 7. Run the refinement pass

After the surface works, do a dedicated second pass — never ship the first draft:

1. **Structure** — the screen matches a page archetype and cards follow the slot anatomy (`.ai/patterns/ui-composition.md`); one primary action per region; grid siblings align on internal baselines.
2. **Typography** — sizes and weights come from the `DESIGN.md` scale; the dashboard page title lives in the header chip, never duplicated as an `h2`.
3. **Spacing** — 4px grid rhythm from the documented scale; no ad-hoc values.
4. **Density** — tables and lists match the house recipes in `.ai/context/design-system.md` (dashed frames, icon+label headers, status dots, pill badges); no empty decorative regions.
5. **Interaction states** — hover, focus ring, disabled, loading, and empty states all exist and use semantic tokens.
6. **Mechanical check** — run `pnpm design:lint`, `pnpm design:tokens`, and `pnpm ui:composition`; fix every error before shipping (CI runs the same checks).

## Validation checklist

- [ ] The nearest existing precedent and relevant shadcn primitive were inspected and named
- [ ] The surface keeps one coherent visual language instead of mixing unrelated ideas
- [ ] The design does not rely on stock AI-marketing skeletons or filler props
- [ ] Content is visible and readable without motion or client-side timing
- [ ] Contrast, spacing, centering, and clipping issues were checked deliberately
- [ ] Interactive controls were verified to behave like real controls
- [ ] Any expressive styling still respects shared tokens and the repository baseline, unless the user approved a broader shift
- [ ] The refinement pass (structure, typography, spacing, density, interaction states) was run
- [ ] `pnpm design:lint`, `pnpm design:tokens`, and `pnpm ui:composition` pass

## Canonical references

- `.ai/references/pols-anti-slop-design-law.md`
- `DESIGN.md`
- `.ai/context/design-system.md`
- `.ai/patterns/ui-composition.md`
- `packages/ui/src/components/button.tsx`

## Anti-patterns (do NOT do)

- Do not copy the vendored external reference into root or tool-specific instructions; link to it
- Do not treat this skill as a mandate to redesign neutral product UI into marketing UI
- Do not change shared palette, typography, or motion language without approval
- Do not remove all visual personality just to avoid common patterns
- Do not ship visually convincing but non-functional controls
