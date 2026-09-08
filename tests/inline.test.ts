import { describe, expect, it } from "vitest";
import { renderInline, plainText } from "../src/lib/markdown/inline";

describe("renderInline", () => {
  it("renders inline markdown without a wrapping paragraph", () => {
    const html = renderInline("Hi [x](http://a) and `b`.");
    expect(html.startsWith("<p>")).toBe(false);
    expect(html).toContain('<a href="http://a" class="squig" data-squig=');
    expect(html).toContain("<code>b</code>");
  });
  it("renders inline math", () => {
    expect(renderInline("$n^2$")).toContain('class="katex"');
  });
  it("plainText strips tags", () => {
    expect(plainText("Elm's `Debug.todo` is [fine](http://x)")).toBe("Elm’s Debug.todo is fine");
  });
  it("plainText decodes basic HTML entities left by tag-stripping", () => {
    expect(plainText("`a < b && c` is [x](http://x)")).toBe("a < b && c is x");
  });
  it("plainText renders math as its TeX source, not the rendered HTML", () => {
    expect(plainText("The sum of the first $n$ odd numbers is $n^2$.")).toBe(
      "The sum of the first n odd numbers is n^2.",
    );
  });
  it("renderInline still renders math with KaTeX markup", () => {
    expect(renderInline("The sum of the first $n$ odd numbers is $n^2$.")).toContain('class="katex"');
  });
});
