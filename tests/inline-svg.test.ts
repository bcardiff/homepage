import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { markdownToHtml } from "satteri";
import { features, mdastPlugins, hastPlugins } from "../src/lib/markdown";

describe("inline SVG", () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10">
  <g id="Layer1" data-name="Layer 1">
    <g id="Shape1"><path id="shapePath1" d="M1,1 L9,9" style="stroke:#323232;fill:none;"/></g>
  </g>
</svg>`;
  let directory: string;
  let fileURL: URL;
  let publicPath: string;

  beforeAll(async () => {
    directory = await mkdtemp(fileURLToPath(new URL("../public/inline-svg-test-", import.meta.url)));
    fileURL = pathToFileURL(`${directory}/article.md`);
    publicPath = `/${basename(directory)}/logo.inline.svg`;
    await writeFile(new URL("logo.inline.svg", fileURL), `<?xml version="1.0" encoding="UTF-8"?>\n${svg}`);
    await writeFile(new URL("no-declaration.inline.svg", fileURL), svg);
  });

  afterAll(async () => {
    if (directory) await rm(directory, { recursive: true });
  });

  async function render(source: string) {
    return (await markdownToHtml(source, { features, mdastPlugins, hastPlugins, fileURL })).html;
  }

  it("inlines root-relative SVGs from public", async () => {
    const html = await render(`![Logo](${publicPath})`);
    expect(html).toContain("<svg");
    expect(html).toContain('viewBox="0 0 10 10"');
    expect(html).not.toContain("<img");
  });

  it("resolves relative SVGs next to the Markdown file", async () => {
    expect(await render("![Logo](logo.inline.svg)")).toContain("<svg");
  });

  it.each(["logo.inline.svg", "no-declaration.inline.svg"])(
    "preserves %s verbatim except for the XML declaration",
    async (url) => {
      const html = await render(`![Logo](${url})`);
      expect(html).toContain(svg);
      expect(html).not.toContain("<?xml");
    },
  );

  it("renders a standalone inline SVG as raw SVG without wrappers", async () => {
    const html = await render("![Logo](logo.inline.svg)");
    expect(html.trim()).toBe(svg);
    expect(html).not.toContain("<p>");
    expect(html).not.toContain("<figure");
  });

  it("can inline SVGs inside a paragraph", async () => {
    const html = await render("Before ![Logo](logo.inline.svg) after.");
    expect(html).toContain(`<p>Before ${svg} after.</p>`);
  });

  it.each(["logo.svg", "logo.png", "https://example.com/logo.inline.svg", "//example.com/logo.inline.svg"])(
    "leaves %s as an image",
    async (url) => {
      expect(await render(`![Logo](${url})`)).toContain(`<img src="${url}"`);
    },
  );

  it("surfaces missing inline SVG files", async () => {
    await expect(render("![Missing](missing.inline.svg)")).rejects.toThrow("ENOENT");
  });
});
