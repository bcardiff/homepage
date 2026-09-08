import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getWriting, getTils } from "../lib/collections";
import { plainText } from "../lib/markdown/inline";
import { site } from "../lib/site";

export async function GET(context: APIContext) {
  const posts = await getWriting();
  const tils = await getTils();
  const items = [
    ...posts.map((p) => ({ title: p.data.title, pubDate: p.date, description: p.data.dek ?? "", link: p.url })),
    ...tils.map((t) => ({ title: plainText(t.line), pubDate: t.date, description: t.note ? "TIL, with a note." : "TIL", link: t.url })),
  ].sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: site.name,
    description: site.kicker,
    site: context.site ?? "https://www.bcardiff.com",
    items,
  });
}
