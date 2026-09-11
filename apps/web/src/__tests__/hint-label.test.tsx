import type * as React from "react";
import { HintLabel } from "@/components/dashboard/hint-label";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { TooltipProvider } from "@turbo/ui/components/tooltip";

const render = (node: React.ReactNode) =>
  renderToStaticMarkup(<TooltipProvider>{node}</TooltipProvider>).replace(
    /<!-- -->/g,
    "",
  );

const hintButtonClass = (html: string) => {
  const button =
    /<button[^>]*aria-label="What &quot;Avg\. response&quot; means"[^>]*>/.exec(
      html,
    )?.[0] ?? "";

  return /class="([^"]*)"/.exec(button)?.[1] ?? "";
};

describe("HintLabel", () => {
  it("renders the label text and a button that names the hint", () => {
    const html = render(
      <HintLabel
        label="Avg. response"
        hint="Mean time to first status change."
      />,
    );

    expect(html).toContain("Avg. response");
    expect(html).toMatch(
      /<button[^>]*aria-label="What &quot;Avg\. response&quot; means"/,
    );
  });

  it("lets children replace the visible label while the hint still names the label", () => {
    const html = render(
      <HintLabel label="Avg. response" hint="Mean time to first status change.">
        <a href="/x">Linked</a>
      </HintLabel>,
    );
    const visibleBeforeButton = html.split("<button", 1)[0] ?? "";

    expect(html).toContain(">Linked</a>");
    expect(visibleBeforeButton).not.toContain("Avg. response");
    expect(html).toMatch(
      /<button[^>]*aria-label="What &quot;Avg\. response&quot; means"/,
    );
  });

  it("keeps the hint button positioned so it stays above a stretched link", () => {
    const html = render(
      <HintLabel
        label="Avg. response"
        hint="Mean time to first status change."
      />,
    );

    expect(hintButtonClass(html).split(" ")).toContain("relative");
  });
});
