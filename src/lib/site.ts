import * as yaml from "js-yaml";
import { z } from "astro/zod";
// Imported through Vite (not fs) so content/site.yaml is part of the module
// graph: the dev server hot-reloads pages when it changes, and the build
// never depends on the working directory.
import raw from "../../content/site.yaml?raw";

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

export function parseSite(source: string): Site {
  return SiteSchema.parse(yaml.load(source));
}

export const site = parseSite(raw);
