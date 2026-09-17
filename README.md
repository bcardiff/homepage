# bcardiff.com

Personal site built with [Astro](https://astro.build). Content lives in `content/`, which can be opened as an Obsidian vault.

## Commands

    npm run dev       # dev server, includes drafts
    npm run build     # production build to dist/, drafts excluded
    npm run preview   # serve dist/
    npm run check     # type and content schema checks
    npm test          # unit tests

Node and npm are provided by devenv and are only on `PATH` inside the project shell, which
[direnv](https://direnv.net) loads from `.envrc`. Run `direnv allow` once. In contexts where
direnv does not hook the shell (scripts, CI, coding agents), prefix commands with `direnv exec .`:

    direnv exec . npm run dev

## Content

- `content/site.yaml`: name, kicker, headline, bio, presence links, author line, optional photo.
- `content/writing/<YYYYMMDD…>-<name>.md`: essays, blog posts, talks. Frontmatter: `slug`, `title`, `kind`, `status`, `tags`, optional `dek`, `date` and `scripts`.
- `content/til/<YYYYMMDD…>-<name>.md`: first paragraph is the one-liner; anything after it makes the TIL its own page.
- `content/cv/<name>.md`: `from`, optional `to`; body is one line.

`status: draft` entries appear only in `npm run dev`. Slugs must be unique within the writing and til collections; the build fails otherwise. Dates default to the filename prefix.

Images go next to the markdown file. `![Caption](img.png "framed")` draws the hatched, pencil-framed figure.

SVG images ending in `.inline.svg` are embedded directly in the HTML as-is, removing only the leading XML declaration. Groups, IDs, attributes, and paths are preserved so scripts and styles can target them. Use `![alt](/images/logo.inline.svg)` for `public/images/logo.inline.svg`, or `![alt](logo.inline.svg)` for a file next to the Markdown document. Other images (including ordinary `.svg` files and remote URLs) remain image elements.

## Per-post scripts

Writing and TIL entries can pull in their own JavaScript through the optional `scripts`
frontmatter list. Entries load in the order given, before the post body:

```yaml
scripts:
  - https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js   # third party library
  - ./20151015-intro-prolog/_scripts.js                # ad-hoc classic script
  - ./20151015-intro-prolog/sketch.module.js           # bundled module
```

- **`http(s)://…` or `//…`** — rendered as a plain `<script src>` in the body, before the
  post content, so the library's globals are available to any `<script>` written inline in
  the Markdown. Raw HTML passes through the Markdown pipeline untouched, so an inline
  `<script>` in a post just works.
- **Anything else** is a path relative to the Markdown file, and lives next to it like
  images do. A file named `*.module.js` (or `.module.ts`) is bundled by Vite: it is an ES
  module, it can `import` packages added to `package.json`, and it is code-split so only
  the posts that ask for it pay the download. Any other `.js`/`.ts` file is served
  verbatim as a deferred classic script — no bundling, no module scope, globals are
  shared with the page. That is the escape hatch for ad-hoc or legacy snippets that assign
  globals or expect jQuery-style libraries.

Deferred classic scripts and modules both run after the document is parsed, so they can
query the rendered post. Missing files fail the build.

The spec is in `docs/superpowers/specs/`. The previous Middleman site is kept in `source/` until its content is migrated. The Middleman toolchain was removed, so the old site can only be built from a pre-migration commit; the old URLs (escritos, articulos, dibujos, pagos) are not redirected yet.
