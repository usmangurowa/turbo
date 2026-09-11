import type * as React from "react";
import { TableCard } from "@/components/dashboard/table-card";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

const render = (node: React.ReactNode) =>
  renderToStaticMarkup(node).replace(/<!-- -->/g, "");

const classOfSlot = (html: string, slot: string) =>
  new RegExp(`data-slot="${slot}"[^>]*class="([^"]*)"`).exec(html)?.[1] ??
  new RegExp(`class="([^"]*)"[^>]*data-slot="${slot}"`).exec(html)?.[1] ??
  "";

const renderTableCard = (
  props?: Partial<React.ComponentProps<typeof TableCard>>,
) => (
  <TableCard title="Tasks" {...props}>
    Rows
  </TableCard>
);

describe("TableCard", () => {
  it("renders the title in an h2 at the title role by default", () => {
    const html = render(renderTableCard());
    const titleClass = classOfSlot(html, "card-title").split(" ");

    expect(html).toContain('<div data-slot="table-card"');
    expect(html).toContain('data-variant="dashed"');
    expect(titleClass).toContain("text-base");
    expect(titleClass).toContain("font-semibold");
    expect(html).toContain("<h2>Tasks</h2>");
  });

  it("renders the title in an h3 when titleAs is h3", () => {
    const html = render(renderTableCard({ titleAs: "h3" }));

    expect(html).toContain("<h3>Tasks</h3>");
    expect(html).not.toContain("<h2");
  });

  it('adds body padding only for padding="sm"', () => {
    expect(
      classOfSlot(render(renderTableCard()), "card-content").split(" "),
    ).toContain("px-0");

    const paddedClass = classOfSlot(
      render(renderTableCard({ padding: "sm" })),
      "card-content",
    ).split(" ");
    expect(paddedClass).toContain("px-4");
    expect(paddedClass).toContain("pb-4");
  });

  it("renders a dashed footer divider only when footer is given", () => {
    const html = render(renderTableCard({ footer: <span>Footer</span> }));

    expect(classOfSlot(html, "card-footer").split(" ")).toContain(
      "border-dashed",
    );
    expect(render(renderTableCard())).not.toContain('data-slot="card-footer"');
  });
});
