import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import * as yaml from "js-yaml";
import { z } from "astro/zod";

const Link = z.object({ label: z.string(), href: z.string() });

export const SiteSchema = z
  .object({
    name: z.string(),
    kicker: z.string(),
    headline: z.string(),
    highlight: z.string().optional(),
    bio: z.string(),
    photo: z.string().optional(),
    presence: z.array(Link),
    author_line: z.string(),
  })
  .refine((s) => !s.highlight || s.headline.includes(s.highlight), {
    message: "highlight must be a substring of headline",
    path: ["highlight"],
  });

export type Site = z.infer<typeof SiteSchema>;

export function loadSite(
  url = new URL("content/site.yaml", pathToFileURL(process.cwd() + "/")),
): Site {
  return SiteSchema.parse(yaml.load(readFileSync(url, "utf8")));
}

export const site = loadSite();
