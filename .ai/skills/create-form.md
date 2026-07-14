# Skill: Create Form

## When to use

"Create a form", "add an input", "handle user submission", "build a sign up page".

## Prerequisite context to load

- `.ai/context/conventions.md` — form patterns (NEVER use `useState` for forms)
- `.ai/context/tech-stack.md` — UI library details
- `.agents/skills/tailwind-patterns/SKILL.md` — Tailwind patterns

## Inputs required from user

- Form fields and data types
- Zod schema validation rules (e.g. min length, regex)
- Submission handler (API endpoint, server action, or mutation)

## Step-by-step procedure

1. **Define the Zod Schema**: Always create a Zod schema for validation. Place this in the relevant `validators` package if shared, or locally if specific to one app.
2. **Initialize react-hook-form**: Use `useForm` from `react-hook-form` along with `@hookform/resolvers/zod`.
3. **Use shadcn/ui components**: Wrap inputs with the `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, and `FormMessage` components.
4. **Never use raw state**: Never use `useState` or `onChange` manually to track input values. Rely exclusively on the `<Form>` context and `<FormField>` render functions.

## Canonical example

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// Adjust imports based on the app workspace
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@turbo/ui/components/form";
import { Input } from "@turbo/ui/components/input";
import { Button } from "@turbo/ui/components/button";

const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
});

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

## Validation checklist

- [ ] A Zod schema is defined and passed to `zodResolver`.
- [ ] `useForm` is used with the Zod resolver.
- [ ] `shadcn/ui` form components (`Form`, `FormField`, etc.) are used.
- [ ] No `useState` is used for managing the form's data.
- [ ] `type="submit"` is present on the submission button.
- [ ] Validation error messages are surfaced using `<FormMessage />`.

## Anti-patterns (do NOT do)

- **NEVER** use `useState` to store form values. Use `react-hook-form`.
- **NEVER** use raw HTML `<input>`, `<select>`, `<textarea>` when shadcn/ui equivalents exist.
- **NEVER** skip validation. Always use a Zod schema.
- **NEVER** handle `onChange` manually unless doing something exceptional outside of the form library's capabilities.
