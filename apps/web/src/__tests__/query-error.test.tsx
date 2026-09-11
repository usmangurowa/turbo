import { QueryError } from "@/components/dashboard/query-error";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

const render = (node: React.ReactNode) =>
  renderToStaticMarkup(node).replace(/<!-- -->/g, "");

const renderQueryError = (
  props?: Partial<React.ComponentProps<typeof QueryError>>,
) => (
  <QueryError
    title="Could not load tasks"
    onRetry={() => undefined}
    {...props}
  />
);

const queryErrorClassTokens = (html: string) =>
  (
    /data-slot="query-error"[^>]*class="([^"]*)"/.exec(html)?.[1] ??
    /class="([^"]*)"[^>]*data-slot="query-error"/.exec(html)?.[1] ??
    ""
  )
    .split(/\s+/)
    .filter(Boolean);

describe("QueryError", () => {
  it("renders the title, a retry button and a sign-in link", () => {
    const html = render(renderQueryError());

    expect(html).toContain("Could not load tasks");
    expect(html).toMatch(/<button[^>]*>Try again<\/button>/);
    expect(html).toMatch(/<a[^>]*href="\/login"[^>]*>Sign in<\/a>/);
  });

  it("frames itself by default and drops the frame with framed={false}", () => {
    const defaultClass = queryErrorClassTokens(render(renderQueryError()));
    const unframedClass = queryErrorClassTokens(
      render(renderQueryError({ framed: false })),
    );

    expect(defaultClass).toContain("border");
    expect(defaultClass).toContain("rounded-2xl");
    expect(defaultClass).toContain("border-dashed");
    expect(unframedClass).not.toContain("border");
    expect(unframedClass).not.toContain("rounded-2xl");
  });

  it("appends className to the state itself", () => {
    const html = render(
      renderQueryError({ framed: false, className: "border-t border-dashed" }),
    );
    const rootClass = queryErrorClassTokens(html);

    expect(rootClass).toContain("border-t");
    expect(rootClass).toContain("border-dashed");
    expect(html.startsWith('<div data-slot="query-error"')).toBe(true);
  });
});
