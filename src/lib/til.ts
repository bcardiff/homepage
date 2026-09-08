import { markdownToHtml } from "satteri";
import { features, mdastPlugins } from "./markdown/index";
import { squiggle } from "./markdown/squiggle";
import { figures } from "./markdown/figures";

/** Throws if `line` is not a single-paragraph one-liner (empty, or renders to more than inline markup). */
export function assertOneLiner(where: string, line: string): void {
  if (!line) {
    throw new Error(`${where}: TIL one-liner is empty`);
  }
  const result = markdownToHtml(line.trim(), { features, mdastPlugins, hastPlugins: [squiggle, figures] });
  if (result instanceof Promise) throw new Error("inline markdown plugins must be synchronous");
  const html = result.html.trim();
  const isSingleParagraph = html.startsWith("<p>") && html.endsWith("</p>") && html.indexOf("<p>", 1) === -1;
  if (!isSingleParagraph) {
    throw new Error(`${where}: TIL one-liner must be a single paragraph`);
  }
}

/** Split a TIL body into the one-liner (first paragraph) and the optional note (the rest). */
export function splitTil(body: string): { line: string; note: string | null } {
  const text = body.trim();
  const m = /\r?\n[ \t]*\r?\n/.exec(text);
  if (!m) return { line: text.replace(/\r\n/g, "\n"), note: null };
  const line = text.slice(0, m.index).trim().replace(/\r\n/g, "\n");
  const note = text.slice(m.index + m[0].length).trim().replace(/\r\n/g, "\n");
  return { line, note: note || null };
}
