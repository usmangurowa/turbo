# Skill: Create Component

## When to use
"Create a component", "add a button variant", "add a UI element to the component library".

## Prerequisite context to load
- `.ai/context/conventions.md` — component naming and patterns
- `.ai/context/tech-stack.md` — UI library details
- `.agents/skills/tailwind-patterns/SKILL.md` — Tailwind patterns
- `packages/ui/src/components/button.tsx` — reference component

## Inputs required from user
- Component name
- Variants needed (if any)
- Whether it's for the shared UI library or app-specific

## Step-by-step procedure
1. **Choose location**:
   - Shared: `packages/ui/src/components/<name>.tsx`
   - App-specific: `apps/web/components/<name>.tsx` or `apps/mobile/src/components/<name>.tsx`
2. **Create the component file** following this pattern:
   ```tsx
   import type { VariantProps } from "class-variance-authority";
   import { cva } from "class-variance-authority";
   import { cn } from "..";

   export const <name>Variants = cva("base-classes", {
     variants: { /* ... */ },
     defaultVariants: { /* ... */ },
   });

   export interface <Name>Props
     extends React.ComponentProps<"div">,
       VariantProps<typeof <name>Variants> {}

   export const <Name> = ({ className, variant, ...props }: <Name>Props) => {
     return (
       <div
         data-slot="<name>"
         className={cn(<name>Variants({ variant, className }))}
         {...props}
       />
     );
   };
   ```
3. **Export** from `packages/ui/src/index.ts` if shared.
4. **Add to `package.json` exports** if it needs a subpath.

## Canonical example
`packages/ui/src/components/button.tsx` — demonstrates CVA variants, `cn()`, `data-slot`, and props extension.

## Validation checklist
- [ ] File uses `kebab-case.tsx` naming
- [ ] Uses `cva` for variants (if applicable)
- [ ] Uses `cn()` for class merging
- [ ] Uses `data-slot` attribute
- [ ] Props extend `React.ComponentProps<"element">`
- [ ] Named export (not default)
- [ ] Exported from barrel file

## Anti-patterns (do NOT do)
- Do not use inline styles
- Do not use default exports
- Do not hardcode colors — use Tailwind theme tokens
- Do not skip the `data-slot` attribute
- Do not create a separate CSS file
