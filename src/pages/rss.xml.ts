import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getWriting, getTils } from "../lib/collections";
import { plainText } from "../lib/markdown/inline";
import { site } from "../lib/site";

export async function GET(context: APIContext) {
  const base = context.site ?? new URL("https://www.bcardiff.com");
  const posts = await getWriting();
  const tils = await getTils();
  const items = [
    ...posts.map((p) => ({ title: p.data.title, pubDate: p.date, description: p.data.dek ?? "", link: new URL(p.url, base).href })),
    ...tils.map((t) => ({ title: plainText(t.line), pubDate: t.date, description: t.note ? "TIL, with a note." : "TIL", link: new URL(t.url, base).href })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: site.name,
    description: site.kicker,
    site: base,
    items,
  });
}
