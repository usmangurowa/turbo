# Skills Index

> Task-oriented procedures for AI agents. Each file describes when to use a skill, what context to load, and step-by-step instructions.

| Skill               | File                                               | Trigger                                                |
| ------------------- | -------------------------------------------------- | ------------------------------------------------------ |
| Project Setup       | [setup-project.md](./setup-project.md)             | "set up this project", "first-time setup", "rebrand"   |
| Commit Message      | [commit-message.md](./commit-message.md)           | Writing a commit message                               |
| PR Description      | [pr-description.md](./pr-description.md)           | Writing a pull request description                     |
| Create Component    | [create-component.md](./create-component.md)       | "create a component", "add a UI element"               |
| Create Package      | [create-package.md](./create-package.md)           | "create a package", "add a shared library"             |
| Create App          | [create-app.md](./create-app.md)                   | "create an app", "add a new application"               |
| Create API Endpoint | [create-api-endpoint.md](./create-api-endpoint.md) | "add an endpoint", "create a route"                    |
| Database Change     | [database-change.md](./database-change.md)         | "update schema", "change database", "add table/column" |
| Create Page         | [create-page.md](./create-page.md)                 | "create a page", "add a route"                         |
| Create Form         | [create-form.md](./create-form.md)                 | "create a form", "add a form", "handle user input"     |
| Anti-Slop UI        | [anti-slop-ui.md](./anti-slop-ui.md)               | "review the UI", "polish this page", "avoid AI slop"   |
| Code Review         | [code-review.md](./code-review.md)                 | "review this code", "check my PR"                      |
| Debug Failure       | [debug-failure.md](./debug-failure.md)             | "fix this error", "debug CI failure"                   |
| Write Tests         | [write-tests.md](./write-tests.md)                 | "write tests", "add test coverage"                     |
| Refactor            | [refactor.md](./refactor.md)                       | "refactor", "clean up this code"                       |
| Update AI Memory    | [update-ai-memory.md](./update-ai-memory.md)       | After introducing new patterns                         |
| Feature Spec        | [feature-spec.md](./feature-spec.md)               | Non-trivial or cross-package feature work              |

## How to use this index

1. Read `AGENTS.md`, then `.ai/context/tech-stack.md` and `.ai/context/conventions.md`.
2. Match the task to the closest skill in this index.
3. If no exact match exists, use the closest skill and follow observed conventions from context files.
4. For non-trivial work, apply `feature-spec.md` before implementation.
5. Before completing the task, apply `update-ai-memory.md`.

## See also

- Deep technology references: `/.agents/skills/` (18 skill bundles)
- Patterns: `../patterns/`
- Context: `../context/`
