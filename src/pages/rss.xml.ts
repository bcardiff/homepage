import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getWriting, getTils } from "../lib/collections";
import { plainText, renderInline } from "../lib/markdown/inline";
import { site } from "../lib/site";

export async function GET(context: APIContext) {
  // astro.config.mjs always sets `site`, so context.site is never undefined here.
  const base = context.site!;
  const posts = await getWriting();
  const tils = await getTils();
  const items = [
    ...posts.map((p) => ({ title: p.data.title, pubDate: p.date, description: p.data.dek ?? "", link: new URL(p.url, base).href })),
    ...tils.map((t) => ({ title: plainText(t.line), pubDate: t.date, description: renderInline(t.line), link: new URL(t.url, base).href })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: site.name,
    description: site.kicker,
    site: base,
    items,
  });
}
