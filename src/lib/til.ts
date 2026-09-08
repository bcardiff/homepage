import { renderInline } from "./markdown/inline";

/** Throws if `line` is not a single-paragraph one-liner (empty, or renders to more than inline markup). */
export function assertOneLiner(where: string, line: string): void {
  if (!line) {
    throw new Error(`${where}: TIL one-liner is empty`);
  }
  const html = renderInline(line);
  if (/<p>|<pre|<ul|<ol/.test(html)) {
    throw new Error(`${where}: TIL one-liner must be a single paragraph`);
  }
}

/** Split a TIL body into the one-liner (first paragraph) and the optional note (the rest). */
export function splitTil(body: string): { line: string; note: string | null } {
  const text = body.trim();
  const m = /\n[ \t]*\n/.exec(text);
  if (!m) return { line: text, note: null };
  const line = text.slice(0, m.index).trim();
  const note = text.slice(m.index + m[0].length).trim();
  return { line, note: note || null };
}
