import { dateFromId } from "./dates";

interface Sluggable { id: string; filePath?: string; data: { slug: string } }
interface Dated { id: string; filePath?: string; data: { date?: Date } }

const where = (e: { id: string; filePath?: string }) => e.filePath ?? e.id;

export function assertUniqueSlugs(collection: string, entries: Sluggable[]): void {
  const seen = new Map<string, Sluggable>();
  for (const e of entries) {
    const prev = seen.get(e.data.slug);
    if (prev) {
      throw new Error(`Duplicate slug "${e.data.slug}" in ${collection}: ${where(prev)} and ${where(e)}`);
    }
    seen.set(e.data.slug, e);
  }
}

export function resolveDate(entry: Dated): Date {
  const d = entry.data.date ?? dateFromId(entry.id);
  if (!d) {
    throw new Error(`${where(entry)}: no date in frontmatter and filename does not start with YYYYMMDD`);
  }
  return d;
}

export const byDateDesc = <T extends { date: Date }>(a: T, b: T) => b.date.getTime() - a.date.getTime();
