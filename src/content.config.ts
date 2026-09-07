import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** Keep the filename stem as the id, so two files with the same `slug` are both loaded and can be reported. */
const stem = ({ entry }: { entry: string }) => entry.replace(/\.md$/, "");

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be lowercase kebab-case");
const status = z.enum(["draft", "published"]);
const tags = z.array(z.string().regex(/^[a-z0-9-]+$/, "tags must be lowercase kebab-case")).default([]);

const writing = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/writing", generateId: stem }),
  schema: z.object({
    slug,
    title: z.string(),
    kind: z.enum(["essay", "blog", "talk"]),
    status,
    date: z.coerce.date().optional(),
    tags,
    dek: z.string().optional(),
  }),
});

const til = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/til", generateId: stem }),
  schema: z.object({
    slug,
    status,
    date: z.coerce.date().optional(),
    tags,
  }),
});

const cv = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/cv", generateId: stem }),
  schema: z.object({
    from: z.number().int(),
    to: z.number().int().nullable().optional(),
  }),
});

export const collections = { writing, til, cv };
