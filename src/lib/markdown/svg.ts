export const CHEVRONS = [
  "M6 3 C 9 6, 12 8, 15 10 C 12 12.5, 9 15, 6 17",
  "M5.5 3.5 C 9.5 6.5, 12.5 8.5, 14.5 10.2 C 12 12, 9 14.5, 6.5 16.5",
  "M6.5 2.8 C 9 5.5, 12.5 7.5, 15.5 9.8 C 12.5 12.5, 9.5 14.8, 5.8 17.2",
] as const;

export const BRACKETS = [
  "M14 3 C 6 30, 8 60, 12 90 S 8 115, 15 117",
  "M13 4 C 7 28, 9 58, 11 88 S 9 112, 14 116",
  "M15 2.5 C 8 32, 7 62, 13 92 S 7 114, 16 118",
] as const;

export const FRAME =
  "M8 7 C 200 3, 450 10, 752 6 C 755 80, 749 180, 753 273 C 500 270, 250 277, 6 272 C 9 190, 4 90, 8 7 Z";

const PENCIL = 'style="filter:url(#pencil)" aria-hidden="true"';
const pick = <T,>(arr: readonly T[], v: number): T => arr[Math.min(Math.max(v, 1), arr.length) - 1];

export function chevronSvg(v: number): string {
  return `<svg class="chevron" viewBox="0 0 20 20" ${PENCIL}><path d="${pick(CHEVRONS, v)}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function bracketSvg(v: number): string {
  return `<svg class="bracket" viewBox="0 0 20 120" preserveAspectRatio="none" ${PENCIL}><path d="${pick(BRACKETS, v)}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;
}

export function frameSvg(): string {
  return `<svg class="frame" viewBox="0 0 760 280" preserveAspectRatio="none" ${PENCIL}><path d="${FRAME}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
}

export function clipboardSvg(): string {
  return `<svg class="clip" viewBox="0 0 20 20" width="14" height="14" ${PENCIL}><path d="M7.2 4.2 C 9 3.7, 11 3.7, 12.8 4.2 L 13 6.2 L 7 6.2 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 5.4 C 4.9 9.5, 4.9 13.5, 5.2 17.4 C 8.3 17.7, 11.7 17.7, 15 17.3 C 15.2 13.4, 15.1 9.4, 14.9 5.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;
}
