import { markdownToHtml } from "satteri";
import { features, mdastPlugins, hastPlugins } from "../src/lib/markdown/index";

/** Render markdown the way the site does, minus Astro's Shiki step. */
export function md(src: string, opts: { fileURL?: URL } = {}): string {
  const result = markdownToHtml(src, { features, mdastPlugins, hastPlugins, ...opts });
  if (result instanceof Promise) throw new Error("plugins must be synchronous");
  return result.html;
}
