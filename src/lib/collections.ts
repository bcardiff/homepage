import { getCollection, type CollectionEntry } from "astro:content";
import { assertUniqueSlugs, resolveDate, byDateDesc } from "./entries";
import { splitTil, assertOneLiner } from "./til";

export type Post = CollectionEntry<"writing"> & { date: Date; url: string };
export type Til = CollectionEntry<"til"> & { date: Date; line: string; note: string | null; url: string };
export type CvEntry = CollectionEntry<"cv">;

const visible = (e: { data: { status: "draft" | "published" } }) =>
  import.meta.env.DEV || e.data.status === "published";

export async function getWriting(): Promise<Post[]> {
  const entries = (await getCollection("writing")).filter(visible);
  assertUniqueSlugs("writing", entries);
  return entries
    .map((e) => ({ ...e, date: resolveDate(e), url: `/writing/${e.data.slug}/` }))
    .sort(byDateDesc);
}

export async function getTils(): Promise<Til[]> {
  const entries = (await getCollection("til")).filter(visible);
  assertUniqueSlugs("til", entries);
  return entries
    .map((e) => {
      const { line, note } = splitTil(e.body ?? "");
      assertOneLiner(e.filePath ?? e.id, line);
      const url = note ? `/til/${e.data.slug}/` : `/til/#${e.data.slug}`;
      return { ...e, date: resolveDate(e), line, note, url };
    })
    .sort(byDateDesc);
}

export async function getCv(): Promise<CvEntry[]> {
  return (await getCollection("cv")).sort((a, b) => b.data.from - a.data.from);
}
