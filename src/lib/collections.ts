import { getCollection, type CollectionEntry } from "astro:content";
import { assertUniqueSlugs, resolveDate, byDateDesc } from "./entries";
import { splitTil, assertOneLiner } from "./til";
import { isListed, isRoutable, type EntryStatus } from "./status";

export type Post = CollectionEntry<"writing"> & { date: Date; url: string };
export type Til = CollectionEntry<"til"> & { date: Date; line: string; note: string | null; url: string };
export type CvEntry = CollectionEntry<"cv">;

const visible = (e: { data: { status: EntryStatus } }) =>
  isListed(e.data.status, import.meta.env.DEV);
const routable = (e: { data: { status: EntryStatus } }) =>
  isRoutable(e.data.status, import.meta.env.DEV);

export async function getWriting({ includeUnlisted = false } = {}): Promise<Post[]> {
  const all = await getCollection("writing");
  assertUniqueSlugs("writing", all);
  const entries = all.filter(includeUnlisted ? routable : visible);
  return entries
    .map((e) => ({ ...e, date: resolveDate(e), url: `/writing/${e.data.slug}/` }))
    .sort(byDateDesc);
}

export async function getTils({ includeUnlisted = false } = {}): Promise<Til[]> {
  const all = await getCollection("til");
  assertUniqueSlugs("til", all);
  const entries = all.filter(includeUnlisted ? routable : visible);
  return entries
    .map((e) => {
      const { line, note } = splitTil(e.body ?? "");
      assertOneLiner(e.filePath ?? e.id, line);
      const url = note || e.data.status === "unlisted" ? `/til/${e.data.slug}/` : `/til/#${e.data.slug}`;
      return { ...e, date: resolveDate(e), line, note, url };
    })
    .sort(byDateDesc);
}

export async function getCv(): Promise<CvEntry[]> {
  return (await getCollection("cv")).sort((a, b) => b.data.from - a.data.from);
}
