import { TablePagination } from "@/components/dashboard/table-pagination";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

const render = (props: { page: number; pageCount: number }) =>
  renderToStaticMarkup(
    <TablePagination {...props} onPageChange={() => undefined} />,
  ).replace(/<!-- -->/g, "");

const anchor = (html: string, label: string) => {
  const match = new RegExp(`<a [^>]*aria-label="${label}"[^>]*>`).exec(html);
  if (!match) throw new Error(`no anchor labelled "${label}"`);
  return {
    disabled: match[0].includes('aria-disabled="true"'),
    tabbable: !match[0].includes('tabindex="-1"'),
  };
};

/**
 * `page` and `pageCount` both come from URL or query state, so every input
 * a stale link can produce must still render a valid label and disable the
 * out-of-range control (see `.ai/context/design-system.md` → Pagination).
 */
describe("TablePagination", () => {
  it("renders the current page and enables both controls mid-range", () => {
    const html = render({ page: 2, pageCount: 3 });
    expect(html).toContain("Page 2 of 3");
    expect(anchor(html, "Go to previous page")).toEqual({
      disabled: false,
      tabbable: true,
    });
    expect(anchor(html, "Go to next page")).toEqual({
      disabled: false,
      tabbable: true,
    });
  });

  it.each([0, -2, Number.NaN, 1.7])(
    "clamps page %p to the first page and disables Previous",
    (page) => {
      const html = render({ page, pageCount: 3 });
      expect(html).toContain("Page 1 of 3");
      expect(anchor(html, "Go to previous page")).toEqual({
        disabled: true,
        tabbable: false,
      });
      expect(anchor(html, "Go to next page").disabled).toBe(false);
    },
  );

  it("clamps page > pageCount to the last page and disables Next", () => {
    const html = render({ page: 4, pageCount: 3 });
    expect(html).toContain("Page 3 of 3");
    expect(anchor(html, "Go to next page")).toEqual({
      disabled: true,
      tabbable: false,
    });
    expect(anchor(html, "Go to previous page").disabled).toBe(false);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "treats pageCount %p as a single page with both controls disabled",
    (pageCount) => {
      const html = render({ page: 2, pageCount });
      expect(html).toContain("Page 1 of 1");
      expect(anchor(html, "Go to previous page").disabled).toBe(true);
      expect(anchor(html, "Go to next page").disabled).toBe(true);
    },
  );

  it("truncates a fractional page count", () => {
    expect(render({ page: 2, pageCount: 2.9 })).toContain("Page 2 of 2");
  });
});
