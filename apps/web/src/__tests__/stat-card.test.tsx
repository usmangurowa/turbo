import { StatCard } from "@/components/dashboard/stat-card";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Badge } from "@turbo/ui/components/badge";
import { TooltipProvider } from "@turbo/ui/components/tooltip";

const render = (node: React.ReactNode) =>
  renderToStaticMarkup(<TooltipProvider>{node}</TooltipProvider>).replace(
    /<!-- -->/g,
    "",
  );

const anchors = (html: string) => html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];

/**
 * A linked stat card is a stretched link: the label is the only anchor and
 * the hint button / action slot must never end up inside it (invalid HTML,
 * broken keyboard semantics — the subject of the first review of #11).
 */
describe("StatCard", () => {
  it("renders the label as plain text when there is no href", () => {
    const html = render(<StatCard label="Active tasks" value={12} />);
    expect(anchors(html)).toHaveLength(0);
    expect(html).toContain("Active tasks");
    expect(html).toContain('data-variant="dashed"');
  });

  it("with href, renders exactly one anchor whose text is the label", () => {
    const html = render(
      <StatCard label="Active tasks" value={12} href="/dashboard/tasks" />,
    );
    const links = anchors(html);
    expect(links).toHaveLength(1);
    expect(links[0]).toMatch(/href="\/dashboard\/tasks"/);
    expect(links[0]).toMatch(/>Active tasks<\/a>$/);
  });

  it("with href + hint + action, keeps every interactive element outside the anchor", () => {
    const html = render(
      <StatCard
        label="Avg. response"
        hint="Mean time to first status change."
        value="42m"
        href="/dashboard/tasks"
        action={<Badge variant="success">Live</Badge>}
      />,
    );
    const links = anchors(html);
    expect(links).toHaveLength(1);
    const inner = (links[0] ?? "").replace(/^<a\b[^>]*>/, "");
    expect(inner).not.toMatch(/<(button|a)\b/);
    expect(inner).toBe("Avg. response</a>");
    expect(html).toMatch(
      /<button[^>]*aria-label="What &quot;Avg. response&quot; means"/,
    );
    expect(html).toContain('data-variant="success"');
  });

  it("with href, positions the card, the hint button and the action above the overlay", () => {
    const html = render(
      <StatCard
        label="Escalations"
        hint="Open tasks marked urgent."
        value={3}
        href="/dashboard/tasks"
        action={<span>menu</span>}
      />,
    );
    const classOf = (slot: string) =>
      new RegExp(`data-slot="${slot}"[^>]*class="([^"]*)"`).exec(html)?.[1] ??
      new RegExp(`class="([^"]*)"[^>]*data-slot="${slot}"`).exec(html)?.[1] ??
      "";
    expect(classOf("stat-card").split(" ")).toContain("relative");
    expect(classOf("card-action").split(" ")).toContain("relative");
    expect(html).toMatch(/<button[^>]*class="[^"]*\brelative\b[^"]*"/);
  });
});
