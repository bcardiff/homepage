# Astro site design

Date: 2026-09-07
Status: approved

## Goal

Rebuild www.bcardiff.com with Astro, following the "Personal site for
academic technologist" design handoff. Content lives in a root `content/`
folder that doubles as an Obsidian vault. The site uses semantic HTML, one
hand-written stylesheet, no CSS framework, and as little client JavaScript
as possible.

The existing Middleman site under `source/` is left untouched. Its content
(escritos, dibujos, artículos, pagos) will be migrated in a later pass and
its old URLs are not preserved yet.

## Scope of this pass

Pages: home, writing index, writing post, TIL stream, TIL note page, tag
pages, RSS feed. The CV appears only as the "Briefly" section on the home
page. Projects and the full CV page are out of scope. Deployment is out of
scope (build to `dist/` only): the site will move from GitHub Pages to
Cloudflare once it works locally, so nothing here depends on either host.
`public/CNAME` is kept only until that move.

## Design reference

The handoff lives outside the repo (`Personal Site.dc.html` and its
`README.md`). Approved screens: 2a home desktop, 3a article desktop, 5a
home mobile, 5b article mobile. Screen 1c (writing index) is used for
structure only and restyled with the orange accent. All tokens, sizes and
SVG paths below come from the handoff README.

## Repository layout

```
content/                 the vault (see Content model)
docs/superpowers/specs/  this document
public/CNAME             copied from source/CNAME
source/                  old Middleman site, untouched
src/
  components/            Nav, Link, Highlight, PhotoFrame, PostList, TilList,
                         CvList, Chevron, ThemeToggle, MenuToggle, icons
  layouts/Base.astro     head, fonts, theme script, pencil filter defs,
                         nav, <main>, site footer
  lib/                   hash.ts, dates.ts, entries.ts, collections.ts,
                         site.ts, til.ts, shiki-flexoki.ts
  lib/markdown/          squiggle.ts, code-copy.ts, figures.ts,
                         blockquote.ts, math.ts, svg.ts, index.ts, inline.ts
  pages/                 index, writing/index, writing/[slug],
                         til/index, til/[slug], tags/[tag], rss.xml.ts
  styles/site.css        the stylesheet
  content.config.ts      collections (glob loaders on ../content)
astro.config.mjs
package.json
tsconfig.json
```

Removed: `Gemfile`, `Gemfile.lock`, `Rakefile`, `config.rb`,
`.ruby-version`.

`.gitignore` becomes:

```
node_modules/
dist/
.astro/
.DS_Store
.env.local
.devenv*
devenv.local.nix
devenv.local.yaml
.direnv
.pre-commit-config.yaml
```

`package.json` scripts: `dev`, `build`, `preview`, `check` (`astro check`),
`test` (vitest). Node comes from devenv; `npm install` runs on shell entry.

## Content model

Everything under `content/` is plain markdown with YAML frontmatter and
standard links, so Obsidian can open the folder as a vault. Images sit
beside the markdown file that uses them and are referenced with relative
paths. No wikilink support.

### `content/site.yaml`

```yaml
name: Brian J. Cardiff
kicker: Software Engineer · Lecturer Professor of Computer Science
headline: Working, teaching, and coding in the open
highlight: coding in the open      # substring of headline to mark
bio: >-                            # markdown inline
  I build software at ...
photo: photo.jpg                   # optional, relative to content/
presence:
  - { label: GitHub, href: https://github.com/bcardiff }
  - { label: Mastodon, href: ... }
  - { label: LinkedIn, href: ... }
  - { label: Email, href: mailto:... }
  - { label: RSS, href: /rss.xml }
author_line: >-                    # markdown inline, article footer
  **Brian J. Cardiff** builds software at ... Replies welcome on [Mastodon](...) or by [email](...).
```

### File naming, slugs and status (writing and TIL)

Files are named `<digits>-<anything>.md`, where the digit run starts
with `YYYYMMDD` and may continue with more digits, so both
`20260814-types-conversation.md` and `202608141132001-types.md`
(`YYYYMMDDHHMMNNN`, as Obsidian's unique-note prefix produces) are valid.
Only the first eight digits are read as the date; anything after them is
ignored. The prefix keeps the vault sorted; the rest of the name is free. The URL slug is
**not** derived from the filename: it comes from a required `slug`
frontmatter property (`^[a-z0-9]+(-[a-z0-9]+)*$`).

Every writing and TIL entry has `status: draft | published`. Published
entries are always built. Drafts are included only in development
(`astro dev`, where `import.meta.env.DEV` is true) and are dropped from
production builds, lists, tag pages, prev/next and the RSS feed.

Slugs must be unique within a collection. `src/lib/collections.ts`
exposes `getWriting()` and `getTils()`, which apply the status filter,
sort by date, and throw an error naming both files when two entries share
a slug. Because every page goes through these helpers, a duplicate fails
`astro build` and `astro check`.

### `content/writing/<digits>-<name>.md`

```yaml
slug: types-as-a-conversation
title: Types as a conversation, not a contract
kind: essay          # essay | blog | talk
status: published    # draft | published
date: 2026-08-14     # optional; defaults to the filename's YYYYMMDD prefix
tags: [types, teaching, compilers]
dek: What teaching type systems ... compiler errors.   # optional
```

URL `/writing/<slug>/`. Previous and next are the neighbours by date
across all kinds.

### `content/til/<digits>-<name>.md`

```yaml
slug: git-range-diff
status: published    # draft | published
date: 2026-09-02     # optional; defaults to the filename's YYYYMMDD prefix
tags: [git]          # optional
```

The body's first paragraph is the one-liner shown in lists (may contain
inline code and links). Any content after the first paragraph is the
optional note. A TIL with a note gets its own page at `/til/<slug>/`; the
date permalink in lists points there. A TIL without a note has no page and
its permalink points to `/til/#<slug>`.

### `content/cv/<name>.md`

CV entries have no URL, so no slug, status or date prefix. The filename is
free.

```yaml
from: 2023
to: null             # null or absent renders "2023–"; a year renders "2019–2021"
```

The body is one line of inline markdown, e.g.
`Software engineer, [NoRedInk](https://noredink.com)`. Entries are ordered
by `from` descending. The home page shows the first three.

### Collections

`src/content.config.ts` defines `writing`, `til` and `cv` with the glob
loader and `base: "./content/<name>"`, plus zod schemas for the fields
above. The loader is given a `generateId` that keeps the filename stem as
the entry id. Without it Astro uses the `slug` frontmatter as the id and
silently drops the second of two entries with the same slug, which would
defeat the uniqueness check. The writing and TIL schemas are built with the schema-context form
so the collection helpers can fill in `date` from the first eight digits
of the entry id when the frontmatter omits it; an entry without a valid
prefix and no `date` makes the helpers throw, failing the build. `site.yaml` is not a collection: `src/lib/site.ts` reads it with
`js-yaml`, validates it with a zod schema, and exports the typed object.

## Routes

| Route | Content |
|---|---|
| `/` | header (kicker, headline with highlight, bio, presence links, optional photo), Writing (latest 3), Today I learned (latest 3), Briefly (top 3 CV) |
| `/writing/` | all posts grouped by year, newest first; each row: day-month date, title, dek, kind label in mono |
| `/writing/<slug>/` | article layout |
| `/til/` | full stream, newest first; each row: chevron, one-liner, date permalink; each row has `id=<slug>` |
| `/til/<slug>/` | article layout for TILs with a note; title is the one-liner, meta row "TIL · date" |
| `/tags/<tag>/` | writing rows then TIL rows carrying that tag |
| `/rss.xml` | writing and TIL entries, newest first, via `@astrojs/rss` |

Nav: site name on the left; Writing, TIL, theme toggle on the right. Current
section rendered in `--ink`. On mobile the nav shows name, theme toggle and
a menu button; the menu opens a full-width list under the header.

## Markup

Semantic elements do the structure; classes only where an element cannot
express the role.

- `Base.astro`: `<header class="site"><nav>…</nav></header>`, `<main>`,
  `<footer class="site">` (nothing in it for now beyond the pencil filter
  `<svg>` defs, which can also live at the end of `<body>`).
- Home: `<header class="intro">` with `<p class="kicker">`, `<h1>`,
  `<p class="bio">`, `<ul class="presence">`; then three `<section>` each
  with `<header><h2>…</h2><a>All →</a></header>` and a list.
- Post lists: `<ol class="posts">` with `<li><time datetime>…</time>
  <a>title</a><p>dek</p></li>`, laid out as the 110px/1fr grid.
- TIL lists: `<ol class="tils">` with `<li id><svg chevron/> <p>one-liner
  <a class="permalink"><time>Sep 2, 2026</time></a></p></li>`.
- CV: `<dl class="cv">` with `<dt>2023–</dt><dd>…</dd>`.
- Article page: `<article>` containing `<header>` (meta row with
  `<p class="meta">KIND · DATE</p>` and `<ul class="tags">`, `<h1>`,
  `<p class="dek">`), the rendered body, and `<footer>` with the author
  line and a `<nav class="prev-next">`.
- Dates use `<time datetime="YYYY-MM-DD">` everywhere. Formats: `Aug 2026`
  in home lists, `Aug 14` in the year-grouped index, `Sep 2, 2026` in TIL
  permalinks, `AUGUST 14, 2026` in article meta.

## Markdown pipeline

Astro 7's default markdown processor is Sätteri, a Rust-backed parser with
its own plugin model (`mdastPlugins` visit the markdown AST, `hastPlugins`
the HTML AST). The site uses it directly via `@astrojs/markdown-satteri`
rather than the legacy unified/remark/rehype path, so every plugin named
below is a Sätteri plugin in `src/lib/markdown/`. The same plugin list is
reused by `renderInline()` (see Inline markdown) so lists, bio and CV lines
render exactly like article bodies.

Order inside Sätteri: Astro's syntax highlighter runs first among hast
plugins, then the site's plugins, then Astro's image and heading-id
plugins. Two consequences shaped the design:

- Math is rendered by an **mdast** plugin (`math.ts`) that replaces `math`
  and `inlineMath` nodes with KaTeX HTML, because by the time hast plugins
  run the highlighter has already turned `$$` blocks into plaintext code.
  Sätteri's `math` feature is enabled; `remark-math`/`rehype-katex` are not
  used.
- The `rawHtml` feature stays **off**: turning it on makes Sätteri lose the
  code language on fenced blocks. Raw HTML in markdown still passes through
  untouched, but plugins cannot see inside it, which is why framed figures
  are triggered by an image title rather than a hand-written `<figure>`.

### Inline markdown

`src/lib/markdown/inline.ts` exports `renderInline(md: string): string`,
which runs Sätteri with the site's plugins on a one-paragraph string and
strips the outer `<p>`. It renders the bio, the author line, CV lines and
TIL one-liners.

## Styling

`src/styles/site.css`, imported once in `Base.astro`. Fonts from
`@fontsource/lora` (400, 500, 600, italic 400) and
`@fontsource/jetbrains-mono` (400, 500), imported in the same place.

Tokens on `:root` (light): `--paper #FFFCF0`, `--bg2 #F2F0E5`,
`--line2 #E6E4D9`, `--line #DAD8CE`, `--ui #B7B5AC`, `--muted #6F6E69`,
`--tx3 #403E3B`, `--tx2 #282726`, `--ink #100F0F`, `--accent #BC5215`,
`--hl #FED3AF`. Dark on `:root[data-theme="dark"]`: `#100F0F`, `#1C1B1A`,
`#282726`, `#343331`, `#575653`, `#878580`, `#B7B5AC`, `#CECDC3`,
`#CECDC3`, `#DA702C`, `#4A2B17`. The same dark block is repeated under
`@media (prefers-color-scheme: dark)` guarded by
`:root:not([data-theme="light"])`, so the system preference applies before
the script runs and when JS is off. `color-scheme` is set to match.

Type and spacing values are those in the handoff README, desktop first with
one `@media (max-width: 640px)` block for the mobile values. `text-wrap:
pretty` on headings, deks and bio. Body copy never lighter than `--tx3`.

Expected class list: `.site`, `.intro`, `.kicker`, `.bio`, `.presence`,
`.posts`, `.tils`, `.cv`, `.meta`, `.tags`, `.dek`, `.prev-next`,
`.squig`, `.highlight`, `.photo`, `.permalink`, `.menu-open`, plus the
code-block and math classes described below. Anything beyond that needs a
reason.

## Hand-drawn elements

All strokes are inline SVG with `filter: url(#pencil)`. The filter is
defined once per page:

```svg
<filter id="pencil" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/>
</filter>
```

### Variant hashing

`src/lib/hash.ts` exports `variant(text: string, n = 3): 1 | 2 | 3`, a
`×31` rolling hash over the code points of the trimmed text, mod `n`, plus
one. It is the single source of variety for underlines, chevrons and
brackets, so a given text always gets the same stroke.

### Squiggle underlines

Three data-URI SVG paths stored as `--squig1`, `--squig2`, `--squig3` on
`:root` and re-declared in the dark block with the dark accent. A link with
`class="squig" data-squig="2"` gets `background-image: var(--squig2)`,
`background-size: 120px 6px`, `repeat-x`, `position: 0 100%`,
`padding-bottom: 2px`, `text-decoration: none`.

Where applied: presence links, inline links in bio, body and CV text, TIL
date permalinks, article footer links. Not applied to nav links, post
titles, tags, or "All →" links.

The `squiggle` hast plugin adds the class and attribute to every `<a>`
whose text is not empty, hashing the link's text content.
The `Link.astro` component does the same for links written in templates.
Inline `<code>` inside such a link gets `padding: 1px 5px 0;
border-radius: 3px 3px 0 0; position: relative; top: -1px`.

### Highlight

`Highlight.astro` wraps the `highlight` phrase from `site.yaml` inside the
`h1`: `position: relative; display: inline-block; white-space: nowrap;
isolation: isolate`, with the two-stroke SVG (`viewBox 0 0 300 48`, width
104%, left -2%, top 2px, z-index -1, `preserveAspectRatio: none`, paths
`M4 30 C 70 22, 150 34, 296 26` width 22 and `M8 20 C 90 26, 200 14, 292
22` width 16, stroke `--hl`, round caps).

### Photo frame

`PhotoFrame.astro`, rendered only when `site.yaml` has `photo`. Image
clipped with `clip-path: path('M10 8 L 192 7 L 190 233 L 8 231 Z')` in a
200×240 box, SVG overlay with the same path (stroke 1.4 `--ink`) and
baseline `M16 237 C 70 240, 140 235, 196 239` (width 1.2). Mobile 160×192
via `transform: scale` of the same paths (the SVG uses the 200×240
viewBox; the container and clip path scale with a CSS variable).

### Chevron

`Chevron.astro` takes the TIL text and picks one of three paths in a
`0 0 20 20` viewBox, stroke `--accent` 1.8, round caps and joins, 14px
(13px mobile):

1. `M6 3 C 9 6, 12 8, 15 10 C 12 12.5, 9 15, 6 17` (handoff)
2. `M5.5 3.5 C 9.5 6.5, 12.5 8.5, 14.5 10.2 C 12 12, 9 14.5, 6.5 16.5`
3. `M6.5 2.8 C 9 5.5, 12.5 7.5, 15.5 9.8 C 12.5 12.5, 9.5 14.8, 5.8 17.2`

### Pull-quote bracket

A CSS pseudo-element cannot carry an SVG path with the pencil filter, so
the `blockquote` hast plugin inserts the bracket SVG (`0 0 120` viewBox stretched to the quote's height, stroke `--accent`
2.4) as the first child, choosing among three paths by hashing the quote
text:

1. `M14 3 C 6 30, 8 60, 12 90 S 8 115, 15 117` (handoff)
2. `M13 4 C 7 28, 9 58, 11 88 S 9 112, 14 116`
3. `M15 2.5 C 8 32, 7 62, 13 92 S 7 114, 16 118`

Blockquote styling: `margin 44px 0; padding 6px 0 6px 36px; 24px/1.4
italic --ink` (21px mobile).

### Figures

The `figures` hast plugin turns a paragraph that contains only an image
into `<figure>` with the `<img>` and, if the image has alt text, a
`<figcaption>` in mono. Figures are `margin: 44px 0`; on mobile they bleed
to the edges (`margin: 36px -22px`). The hatched background and wobbly
frame from the mock are opt-in through the image title:
`![Caption](drawing.png "framed")` becomes `<figure class="framed">` with
the wobbly-rectangle SVG inserted before the image and the title dropped.
Obsidian renders the same line as a plain image.

### Theme toggle and menu icons

Inline SVG from the handoff (half-filled wobbly circle, 18px; three wobbly
lines, 22px), colour `--tx3`, inside `<button type="button">` elements with
`aria-label`s.

## Code blocks

Astro's built-in Shiki with a custom Flexoki theme pair in
`src/lib/shiki-flexoki.ts` (light and dark) built from the palette's eight
hues (red `#AF3029`/`#D14D41`, orange `#BC5215`/`#DA702C`, yellow
`#AD8301`/`#D0A215`, green `#66800B`/`#879A39`, cyan `#24837B`/`#3AA99F`,
blue `#205EA6`/`#4385BE`, purple `#5E409D`/`#8B7EC8`, magenta
`#A02F6F`/`#CE5D97`) with the site's `--bg2` as background. Shiki runs in
dual-theme mode (`themes: { light, dark }`, `defaultColor: false`), which
emits `--shiki-light` and `--shiki-dark` variables per token; the
stylesheet selects one based on `data-theme` / `prefers-color-scheme`.
Languages of note: crystal, haskell, prolog, shellscript, latex, elm,
erlang, nix; all are in Shiki's bundle.

The `code-copy` hast plugin wraps each highlighted `<pre>` in
`<figure class="code" data-lang="…">` and prepends `<button type="button" class="copy">` with a
hand-drawn clipboard icon and a mono "Copy" label, positioned top-right.
A small script in `Article.astro` (emitted on every article page; a no-op
when the page has no code blocks) copies `pre.textContent` with the
Clipboard API and flips the label to "Copied" for about a second. Without
JS the button is harmless.

Block styling: `padding 20px 24px; border-radius 4px; background --bg2;
15px/1.6 mono` (13.5px mobile, bleeding to the edges). Inline code:
`15–16px mono; background --bg2; padding 1px 5px; radius 3px`.

## Math

Sätteri's `math` feature plus the `math` mdast plugin (KaTeX's
`renderToString`). `$…$` and `$$…$$` are rendered to HTML at build time. `katex/dist/katex.min.css` is
imported in `Base.astro`; its fonts are self-hosted from the package and
only fetched by the browser when a page uses them.

## Client JavaScript

1. Theme: inline script in `<head>`, before the stylesheet, reads
   `localStorage["bjc-theme"]` and sets `data-theme` on `<html>` when a
   value is stored. The toggle button flips between light and dark
   (starting from the effective theme) and stores the choice.
2. Mobile menu: the menu button toggles `.menu-open` on the `nav`. When
   the script has not run, the button is hidden by CSS and the list is
   visible.
3. Copy button handler, described above.

Nothing else. No framework, no islands.

## Placeholder content

The vault ships with the handoff's placeholder copy so every page renders:
three published writing entries (the essay from screen 3a in full, with
its figure, pull quote and code block; two blog posts with short bodies),
five published TIL entries (two with notes, one containing math), one
draft TIL, and the three Briefly CV lines.

One draft writing entry, `content/writing/<digits>-gallery.md` with slug
`gallery`, is a permanent playground rather than placeholder copy. It
exercises every widget the markdown pipeline supports, one section per
widget with a short note on the syntax used: headings, paragraphs with
inline links (all three squiggle variants), inline code inside a link,
lists, a plain image figure and a framed figure, pull quotes (all three
bracket variants), code blocks in crystal, haskell, prolog and shell with
the copy button, inline and display math, and a table. Because it is a
draft it is visible only in development and is never deployed. `site.yaml` carries the real name, kicker,
headline, bio draft, and presence links. The photo is omitted (no `photo`
key) until a real one is added; layout must look right without it.

## Testing and verification

- `npm run check` (astro check) passes: content schemas validate, no type
  errors in templates.
- `npm run test` (vitest) covers `variant()` (stable, spread across three
  values for sample strings), the markdown plugins (squiggle adds class and
  attribute and skips empty links; code-copy wraps `<pre>` and carries the
  language; figures and framed figures; blockquote bracket; math),
  `renderInline`, the TIL first-paragraph split, the filename date prefix
  parser (8-digit and 15-digit prefixes, invalid prefix), and the duplicate-slug check (two entries with one slug throw,
  the message names both files).
- A production build with a draft entry present does not emit it, and a
  dev server does; both checked once by hand.
- `npm run build` succeeds; `dist/` contains `index.html`,
  `writing/index.html`, one folder per post, `til/index.html`, a folder
  per TIL with a note, `tags/<tag>/index.html`, `rss.xml`, and `CNAME`.
- Visual check: dev server screenshots at 1100px and 390px for the home
  page and the essay, compared against the four handoff screenshots, in
  both themes.
- Manual: theme toggle persists across reloads; copy button copies the full
  block; math renders; each of the three squiggle and chevron variants
  appears somewhere on the placeholder content.
