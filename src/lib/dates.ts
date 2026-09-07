const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Date (UTC midnight) from the leading YYYYMMDD of an id like `20260814-title` or `202608141132001-title`. */
export function dateFromId(id: string): Date | undefined {
  const m = /^(\d{4})(\d{2})(\d{2})\d*-/.exec(id);
  if (!m) return undefined;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d));
  const valid = date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
  return valid ? date : undefined;
}

const mon = (d: Date) => MONTHS[d.getUTCMonth()].slice(0, 3);

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
export const fmtMonthYear = (d: Date) => `${mon(d)} ${d.getUTCFullYear()}`;
export const fmtDayMonth = (d: Date) => `${mon(d)} ${d.getUTCDate()}`;
export const fmtFull = (d: Date) => `${mon(d)} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
export const fmtLong = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
