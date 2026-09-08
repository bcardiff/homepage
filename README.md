# bcardiff.com

Personal site built with [Astro](https://astro.build). Content lives in `content/`, which can be opened as an Obsidian vault.

## Commands

    npm run dev       # dev server, includes drafts
    npm run build     # production build to dist/, drafts excluded
    npm run preview   # serve dist/
    npm run check     # type and content schema checks
    npm test          # unit tests

Node is provided by devenv (`direnv allow`).

## Content

- `content/site.yaml`: name, kicker, headline, bio, presence links, author line, optional photo.
- `content/writing/<YYYYMMDD…>-<name>.md`: essays, blog posts, talks. Frontmatter: `slug`, `title`, `kind`, `status`, `tags`, optional `dek` and `date`.
- `content/til/<YYYYMMDD…>-<name>.md`: first paragraph is the one-liner; anything after it makes the TIL its own page.
- `content/cv/<name>.md`: `from`, optional `to`; body is one line.

`status: draft` entries appear only in `npm run dev`. Slugs must be unique per collection; the build fails otherwise. Dates default to the filename prefix.

Images go next to the markdown file. `![Caption](img.png "framed")` draws the hatched, pencil-framed figure.

The design handoff and spec are in `docs/superpowers/specs/`. The previous Middleman site is kept in `source/` until its content is migrated.
