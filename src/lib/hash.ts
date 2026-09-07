/** ×31 rolling hash over code points of the trimmed text, mod n, plus one → 1..n. */
export function variant(text: string, n = 3): number {
  let h = 0;
  for (const ch of text.trim()) {
    h = (Math.imul(h, 31) + (ch.codePointAt(0) ?? 0)) >>> 0;
  }
  return (h % n) + 1;
}
