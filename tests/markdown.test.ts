import { describe, expect, it } from "vitest";
import { md } from "./helpers";
import { variant } from "../src/lib/hash";

describe("squiggle", () => {
  it("adds class and a stable variant from the link text", () => {
    const html = md("See [the docs](http://x) now.");
    expect(html).toContain(`<a href="http://x" class="squig" data-squig="${variant("the docs")}">the docs</a>`);
  });
  it("skips links with no text", () => {
    expect(md("[](http://x)")).not.toContain("squig");
  });
});

describe("code-copy", () => {
  it("wraps pre in a figure with the language and a copy button", () => {
    const html = md("```crystal\nputs 1\n```");
    expect(html).toMatch(/<figure class="code" data-lang="crystal"><pre[\s\S]*<\/pre><button type="button" class="copy" aria-label="Copy code"><svg class="clip"[\s\S]*<span>Copy<\/span><\/button><\/figure>/);
  });
});

describe("figures", () => {
  it("turns an image paragraph into a figure with caption from alt", () => {
    expect(md("![A caption](pic.png)")).toBe('<figure><img src="pic.png" alt="A caption"><figcaption>A caption</figcaption></figure>\n');
  });
  it("omits the caption when alt is empty", () => {
    expect(md("![](pic.png)")).toBe('<figure><img src="pic.png" alt=""></figure>\n');
  });
  it("frames when the title is framed and drops the title", () => {
    const html = md('![Fig](pic.png "framed")');
    expect(html).toMatch(/^<figure class="framed"><div><svg class="frame"[\s\S]*<\/svg><img src="pic.png" alt="Fig"><\/div><figcaption>Fig<\/figcaption><\/figure>\n$/);
    expect(html).not.toContain("title=");
  });
  it("leaves paragraphs with text alone", () => {
    expect(md("Look ![x](pic.png) here")).toContain("<p>Look <img");
  });
});

describe("blockquote", () => {
  it("prepends a bracket chosen by the quote text", () => {
    const html = md("> Be kind.\n> Really.");
    const v = variant("Be kind.\nReally.");
    expect(html).toMatch(new RegExp(`^<blockquote data-bracket="${v}"><svg class="bracket"[\\s\\S]*</svg>\\n?<p>Be kind.\\nReally.</p>`));
  });
});

describe("math", () => {
  it("renders inline and display math with KaTeX", () => {
    const html = md("Energy $E=mc^2$.\n\n$$\nx^2\n$$");
    expect(html).toContain('<span class="katex">');
    expect(html).toContain('<span class="katex-display">');
    expect(html).not.toContain("language-math");
  });
});

describe("til-note", () => {
  const til = new URL("file:///repo/content/til/20260902-git.md");
  it("strips the first paragraph of TIL files", () => {
    const html = md("The one-liner.\n\nThe note.", { fileURL: til });
    expect(html).not.toContain("one-liner");
    expect(html).toContain("<p>The note.</p>");
  });
  it("leaves other files alone", () => {
    const html = md("First.\n\nSecond.", { fileURL: new URL("file:///repo/content/writing/20260101-a.md") });
    expect(html).toContain("<p>First.</p>");
  });
});
