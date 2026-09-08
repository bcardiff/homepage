import { markdownToHtml } from "satteri";
import { features, mdastPlugins } from "./index";
import { squiggle } from "./squiggle";
import { mathAsText } from "./math";

/** Render a one-paragraph markdown string to inline HTML (no outer <p>). */
export function renderInline(md: string): string {
  const result = markdownToHtml(md.trim(), { features, mdastPlugins, hastPlugins: [squiggle] });
  if (result instanceof Promise) throw new Error("inline markdown plugins must be synchronous");
  return result.html.trim().replace(/^<p>/, "").replace(/<\/p>$/, "");
}

/** Plain text of a one-paragraph markdown string, for <title> and RSS titles. */
export function plainText(md: string): string {
  const result = markdownToHtml(md.trim(), { features, mdastPlugins: [mathAsText], hastPlugins: [] });
  if (result instanceof Promise) throw new Error("inline markdown plugins must be synchronous");
  return result.html
    .trim()
    .replace(/^<p>/, "")
    .replace(/<\/p>$/, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, "&");
}
