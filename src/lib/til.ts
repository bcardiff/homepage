/** Split a TIL body into the one-liner (first paragraph) and the optional note (the rest). */
export function splitTil(body: string): { line: string; note: string | null } {
  const text = body.trim();
  const m = /\n[ \t]*\n/.exec(text);
  if (!m) return { line: text, note: null };
  const line = text.slice(0, m.index).trim();
  const note = text.slice(m.index + m[0].length).trim();
  return { line, note: note || null };
}
