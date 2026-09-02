# Pattern: UI Composition

## Authority

`DESIGN.md` defines the Structured Restraint language and mirrors runtime tokens.
This file defines how primitives compose into components and pages. Read both
before creating, changing, or reviewing UI.

The runtime source remains `tooling/tailwind/theme.css`. A runtime token change
must update `DESIGN.md` in the same commit. Validate UI work with:

```bash
pnpm design:lint
pnpm design:tokens
pnpm ui:composition
```

## Composition Principles

1. **Anatomy is not optional.** Composite slots carry layout, semantics, and
   accessibility. Do not replace them with loose children.
2. **One alignment axis.** A section should have one obvious edge or centerline.
   Align labels, controls, and repeated content to it.
3. **Dense, not cramped.** Use close spacing inside a unit and a larger,
   repeatable gap between units.
4. **Hierarchy before decoration.** Type, spacing, borders, and tonal surfaces
   establish importance. Gradients, glows, and nested cards do not.
5. **States are compositions.** Loading, empty, and error states preserve layout
   and explain the next useful action.

## Composite Slot Grammar

### Card

```text
Card
  -> CardHeader(
       CardTitle,
       CardDescription?,
       CardAction?
     )
  -> CardContent
  -> CardFooter?
```

| Slot              | Cardinality | Rule                                    |
| ----------------- | ----------- | --------------------------------------- |
| `CardHeader`      | exactly one | First top-level slot                    |
| `CardTitle`       | exactly one | First semantic slot inside `CardHeader` |
| `CardDescription` | zero or one | Follows `CardTitle`                     |
| `CardAction`      | zero or one | Last semantic slot inside `CardHeader`  |
| `CardContent`     | exactly one | Follows `CardHeader`                    |
| `CardFooter`      | zero or one | Last top-level slot                     |

Do not put loose workflow content directly under `Card`, omit a title, reorder
slots, or nest one `Card` inside another. A visually small tile still needs a
real title and content region.

### Dialog, Sheet, and Drawer

```text
DialogContent
  -> DialogHeader(DialogTitle, DialogDescription?)
  -> body
  -> DialogFooter?

SheetContent
  -> SheetHeader(SheetTitle, SheetDescription?)
  -> body
  -> SheetFooter?

DrawerContent
  -> DrawerHeader(DrawerTitle, DrawerDescription?)
  -> body
  -> DrawerFooter?
```

Every content subtree contains its matching header and title. The title may use
`className="sr-only"` when the visible trigger or surrounding interface already
communicates it. Descriptions stay in the header. Put confirmation and dismissal
actions in the matching footer, after the body.

Conditional branches must each preserve complete accessible anatomy. A title in
one branch does not make a title-less branch acceptable at runtime.

### Avatar

```text
Avatar
  -> AvatarImage?
  -> AvatarFallback
```

`AvatarFallback` is required and follows `AvatarImage`. Use initials, a concise
identifier, or an icon with an accessible name. Never depend on the image
loading.

### Grouped and Behavioral Primitives

- `TabsTrigger` belongs inside `TabsList`.
- `SelectItem`, `DropdownMenuItem`, and `CommandItem` belong inside their
  matching group components.
- Forms use `FieldGroup` and `Field`; grouped inputs use `InputGroup` and its
  dedicated input or textarea slot.
- Loading buttons compose `Spinner` and set `disabled`; there is no `loading`
  prop.
- Use `Alert`, `Empty`, `Separator`, `Skeleton`, and `Badge` instead of
  hand-rolled equivalents.
- Use the primitive trigger composition API (`asChild` for the current Radix
  components) rather than nesting interactive controls.

## Accessibility Invariants

| Composition          | Invariant                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `DialogContent`      | Contains `DialogTitle` inside `DialogHeader`                                                   |
| `SheetContent`       | Contains `SheetTitle` inside `SheetHeader`                                                     |
| `DrawerContent`      | Contains `DrawerTitle` inside `DrawerHeader`                                                   |
| `Avatar`             | Contains exactly one `AvatarFallback`                                                          |
| Icon-only `Button`   | Has `aria-label`, `aria-labelledby`, mobile `accessibilityLabel`, or meaningful `sr-only` text |
| Icon inside `Button` | Uses `data-icon="inline-start"` or `data-icon="inline-end"` when it accompanies text           |
| Form error           | Uses `data-invalid` on `Field` and `aria-invalid` on the control                               |

Visible labels are preferred. Screen-reader-only labels are for controls whose
purpose is visually unambiguous, not a substitute for unclear interaction
design.

## Page Grammar

### Dashboard Route

```text
DashboardLayout
  -> shared sticky header(PageTitle, HeaderActions)
  -> route content
```

`apps/web/src/app/dashboard/layout.tsx` owns the sticky header and
`PageTitle`. Dashboard route content does not repeat that title with another
`h1` or `h2`. Begin with the route's primary workflow, toolbar, or state.

### Standalone Web Page

```text
Page
  -> PageHeader(h1, description?, actions?)
  -> main content
```

Use one `h1`. Keep its description adjacent and place page-level actions on the
same row at wide widths or immediately after it on narrow widths. Landing pages
may use full-width sections, but each section still has one alignment axis and
one dominant message.

### Mobile Screen

```text
Screen
  -> navigation affordance?
  -> ScreenHeader(title, description?)
  -> primary content
  -> persistent action?
```

Respect the safe-area container. Keep the primary action reachable and do not
repeat the native navigation title inside the screen.

## Layout and Rhythm

- Use the spacing scale documented in `DESIGN.md`; arbitrary margin, padding,
  gap, width, height, inset, and translation values are invalid in authored UI.
- Prefer `flex` or `grid` with `gap-*`; do not use `space-x-*` or `space-y-*` for
  ordinary stacks.
- Use `size-*` when width and height are equal.
- Use `compact` rhythm for local stacks, `component` rhythm between component
  regions, and `section` rhythm between page sections.
- Broad web content uses `container`, capped by the repository's `80rem`
  container width. Forms use an existing semantic width such as `max-w-sm`;
  prose and section intros use the nearest existing `max-w-*` utility.
- Repeated cards, rows, and controls share the same edge, padding, and internal
  slot structure. Do not correct individual alignment with one-off offsets.
- Prefer borders and tonal surfaces. Use the lowest documented shadow that
  separates an overlay or floating surface.

## State Grammar

### Loading

Use `Skeleton` shapes that approximate the final layout. Keep the page shell and
headers visible. `Skeleton` is the only primitive allowed to own
`animate-pulse`; authored app and composite code never uses that class directly.

### Empty

```text
Empty
  -> EmptyHeader(
       EmptyMedia?,
       EmptyTitle,
       EmptyDescription?
     )
  -> EmptyContent?
```

Explain what is absent and why it matters. Add a primary recovery or creation
action when one exists.

### Error

Use the same `Empty` anatomy with a specific failure title, a useful
description, and a retry or recovery action when the operation supports one.
Do not show a blank card, raw exception, or indefinite loading state.

## Do / Don't Pairs

These correct examples are current repository compositions. The rejected
equivalents show the structural shortcut the grammar forbids.

### Card anatomy

**Do** — `apps/mobile/src/app/(tabs)/index.tsx`

```tsx
<Card className="flex-1 items-center gap-3 py-4">
  <CardHeader className="items-center px-4">
    <CardTitle className="text-muted-foreground text-sm">Projects</CardTitle>
  </CardHeader>
  <CardContent className="px-4">
    <Text className="text-3xl font-bold">0</Text>
  </CardContent>
</Card>
```

**Don't** — flatten the same tile into loose children.

```tsx
<Card className="flex-1 items-center p-4">
  <Text className="text-3xl font-bold">0</Text>
  <Text className="text-muted-foreground text-sm">Projects</Text>
</Card>
```

### Overlay anatomy

**Do** — `apps/web/src/components/dashboard/api-keys-card.tsx`

```tsx
<DialogContent className="sm:max-w-md">
  <DialogHeader>
    <DialogTitle>Save your API key</DialogTitle>
    <DialogDescription>
      This is the only time the full key is shown. Store it somewhere safe.
    </DialogDescription>
  </DialogHeader>
  <Alert>{/* key warning */}</Alert>
  <DialogFooter>{/* actions */}</DialogFooter>
</DialogContent>
```

**Don't** — use visible body copy as a substitute for an accessible title.

```tsx
<DialogContent>
  <p>Save your API key somewhere safe.</p>
  <Button>Done</Button>
</DialogContent>
```

### Avatar fallback

**Do** — `apps/web/src/components/dashboard/header-actions.tsx`

```tsx
<Avatar className="ring-background size-7 ring-2">
  <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
    +1
  </AvatarFallback>
</Avatar>
```

**Don't** — assume an image always loads.

```tsx
<Avatar>
  <AvatarImage src={member.image} alt={member.name} />
</Avatar>
```

### Icon-only action

**Do** — `apps/web/src/components/dashboard/assistant-view.tsx`

```tsx
<Button type="submit" size="icon" aria-label="Send message">
  {isStreaming ? <Spinner /> : <Icon icon={SentIcon} />}
</Button>
```

**Don't** — make the icon the only name.

```tsx
<Button type="submit" size="icon">
  <Icon icon={SentIcon} />
</Button>
```

### Loading and empty states

**Do** — current dashboard state primitives.

```tsx
<Skeleton className="h-4 w-1/3" />

<Empty>
  <EmptyHeader>
    <EmptyTitle>No API keys yet</EmptyTitle>
    <EmptyDescription>Create a key to call the API from scripts or CI.</EmptyDescription>
  </EmptyHeader>
</Empty>
```

**Don't** — hand-roll a pulse or leave an unlabeled blank region.

```tsx
<div className="bg-muted h-4 w-1/3 animate-pulse" />
<div className="border-border min-h-40 border" />
```

## Mechanical Enforcement

`scripts/ai/check-ui-composition.mjs` uses an import-aware balanced JSX scan. It
tracks conditional branches and ignores comments and code string literals. It
checks authored web and mobile source plus authored shared composites. It
excludes registry-managed web primitives, mobile primitives under
`apps/mobile/src/components/ui`, and `packages/ui/src/components/ai-elements`.

The checker fails on:

- missing, duplicate, nested, or misordered Card slots;
- missing or misplaced overlay titles;
- missing or misordered Avatar fallbacks;
- unnamed icon-sized buttons;
- raw palette and arbitrary color classes;
- arbitrary spacing and typography classes; and
- `animate-pulse` outside the vendored `Skeleton` primitive.

Diagnostics are sorted and emitted as `file:line`. There is no baseline or
blanket suppression. Fix authored violations. If registry ownership changes,
classify the file explicitly in the checker rather than weakening a rule.
