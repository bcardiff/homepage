# Astro Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild www.bcardiff.com as an Astro 7 static site driven by a root `content/` Obsidian vault, following the handoff design (Flexoki palette, Lora + IBM Plex Mono, hand-drawn pencil accents, light/dark).

**Architecture:** Astro content collections read `content/writing`, `content/til`, `content/cv` with the glob loader. Markdown goes through Astro's default Sätteri processor with site plugins (squiggle underlines, code-copy wrapper, figures, blockquote bracket, KaTeX math). One hand-written stylesheet styles semantic elements; client JS is limited to theme toggle, mobile menu, and copy button.

**Tech Stack:** Astro 7, Sätteri (`@astrojs/markdown-satteri`), Shiki (built in, custom Flexoki theme), KaTeX, Fontsource, js-yaml, Vitest, `@astrojs/check`. Node 24 from devenv.

**Spec:** `docs/superpowers/specs/2026-09-07-astro-site-design.md`

## Global Constraints

- Node `>=22.12.0` (Astro 7). Node and npm come from devenv; do not add other package managers.
- No CSS framework. One stylesheet `src/styles/site.css`. Allowed class names: `.site`, `.intro`, `.kicker`, `.bio`, `.presence`, `.posts`, `.tils`, `.cv`, `.meta`, `.tags`, `.dek`, `.prev-next`, `.squig`, `.highlight`, `.photo`, `.permalink`, `.menu-open`, `.code`, `.copy`, `.framed`, `.kind`, `.name`, `.controls`, `.theme`, `.menu`, `.prev`, `.next`, `.chevron`, `.bracket`, `.frame`, `.clip`, and body classes `.home`, `.article`, `.index`. Anything else needs a reason in the commit message.
- Colours (light): `--paper #FFFCF0 --bg2 #F2F0E5 --line2 #E6E4D9 --line #DAD8CE --ui #B7B5AC --muted #6F6E69 --tx3 #403E3B --tx2 #282726 --ink #100F0F --accent #BC5215 --hl #FED3AF`. Dark: `#100F0F #1C1B1A #282726 #343331 #575653 #878580 #B7B5AC #CECDC3 #CECDC3 #DA702C #4A2B17`.
- Fonts: Lora 400/500/600 + italic 400; IBM Plex Mono 400/500, self-hosted via Fontsource.
- Writing/TIL filenames `<digits>-<anything>.md`, digits start with `YYYYMMDD`. Required `slug` (`^[a-z0-9]+(-[a-z0-9]+)*$`) and `status: draft | published`. Drafts only in dev. Duplicate slugs fail the build.
- Copy verbatim: kicker "Software Engineer · Adjunct Professor of Computer Science"; headline "Working, teaching, and coding in the open" (highlight "coding in the open"); section headings "Writing", "Today I learned", "Briefly"; links "All →"; nav "Writing", "TIL".
- `source/` (old Middleman site) is never modified or deleted.
- Commit after every task with the trailer lines:
  ```
  Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01EeTXBjBYeTSg3ufD3WpFwx
  ```

## File structure

```
package.json, package-lock.json, astro.config.mjs, tsconfig.json, vitest.config.ts, .gitignore
public/CNAME
content/site.yaml
content/writing/<digits>-*.md          content/til/<digits>-*.md          content/cv/*.md
src/content.config.ts                   collections + schemas
src/lib/hash.ts                         variant(text, n)
src/lib/dates.ts                        dateFromId, isoDate, fmtMonthYear, fmtDayMonth, fmtFull, fmtLong
src/lib/entries.ts                      assertUniqueSlugs, resolveDate, byDateDesc (pure, testable)
src/lib/til.ts                          splitTil(body)
src/lib/site.ts                         SiteSchema, loadSite, site
src/lib/collections.ts                  getWriting, getTils, getCv (uses astro:content)
src/lib/shiki-flexoki.ts                light + dark Shiki themes
src/lib/markdown/svg.ts                 chevronSvg, bracketSvg, frameSvg, clipboardSvg + path constants
src/lib/markdown/squiggle.ts            hast plugin
src/lib/markdown/code-copy.ts           hast plugin
src/lib/markdown/figures.ts             hast plugin
src/lib/markdown/blockquote.ts          hast plugin
src/lib/markdown/math.ts                mdast plugin
src/lib/markdown/til-note.ts            hast plugin factory (strips first paragraph of TIL notes)
src/lib/markdown/index.ts               features, mdastPlugins, hastPlugins
src/lib/markdown/inline.ts              renderInline, plainText
src/layouts/Base.astro                  html shell, nav, theme script, pencil filter
src/layouts/Article.astro               article header/footer/prev-next
src/components/{Nav,ThemeToggle,MenuToggle,Link,Highlight,PhotoFrame,PostList,TilList,CvList}.astro
src/pages/index.astro
src/pages/writing/index.astro           src/pages/writing/[slug].astro
src/pages/til/index.astro               src/pages/til/[slug].astro
src/pages/tags/[tag].astro              src/pages/rss.xml.ts
src/styles/site.css
tests/*.test.ts
```

---

### Task 1: Scaffold the Astro project and remove the Ruby toolchain

**Files:**
- Delete: `Gemfile`, `Gemfile.lock`, `Rakefile`, `config.rb`, `.ruby-version`
- Create: `.gitignore` (replace), `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `public/CNAME`, `src/pages/index.astro`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `preview`, `check`, `test`; `site` set to `https://www.bcardiff.com`.

- [ ] **Step 1: Remove Ruby files**

```bash
git rm -q Gemfile Gemfile.lock Rakefile config.rb .ruby-version
```

- [ ] **Step 2: Replace `.gitignore`**

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

- [ ] **Step 3: Create `package.json`**

```json
{
  "name": "bcardiff-homepage",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "astro": "astro"
  }
}
```

- [ ] **Step 4: Install dependencies**

```bash
npm install astro@^7 @astrojs/markdown-satteri satteri @astrojs/rss katex js-yaml @fontsource/lora @fontsource/ibm-plex-mono
npm install -D @astrojs/check typescript vitest shiki @types/js-yaml @types/katex @types/hast @types/mdast
```

Expected: `package-lock.json` created, `node_modules/astro/package.json` reports version 7.x.

- [ ] **Step 5: Create `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`**

`astro.config.mjs`:
```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.bcardiff.com",
});
```

`tsconfig.json`:
```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "source", "node_modules"]
}
```

`vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["tests/**/*.test.ts"] },
});
```

- [ ] **Step 6: Create `public/CNAME` and a placeholder page**

```bash
cp source/CNAME public/CNAME
```

`src/pages/index.astro`:
```astro
---
---
<html lang="en"><head><meta charset="utf-8" /><title>Brian J. Cardiff</title></head>
<body><h1>Brian J. Cardiff</h1></body></html>
```

- [ ] **Step 7: Verify build and test runner**

Run: `npm run build && ls dist && npm test`
Expected: `dist/index.html` and `dist/CNAME` exist; vitest reports "No test files found" and exits 0 (or run `npx vitest run --passWithNoTests`).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold astro project, drop middleman toolchain"
```

---

### Task 2: Variant hash

**Files:**
- Create: `src/lib/hash.ts`
- Test: `tests/hash.test.ts`

**Interfaces:**
- Produces: `variant(text: string, n = 3): number` returning an integer in `1..n`, stable for the same trimmed text. Used by squiggle, chevron, bracket, Link, TilList.

- [ ] **Step 1: Write the failing test**

`tests/hash.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { variant } from "../src/lib/hash";

describe("variant", () => {
  it("is a ×31 rolling hash mod n, plus one", () => {
    expect(variant("a")).toBe(2); // 97 % 3 = 1 → 2
    expect(variant("ab")).toBe(1); // (97*31 + 98) = 3105, 3105 % 3 = 0 → 1
  });
  it("ignores surrounding whitespace", () => {
    expect(variant("  GitHub \n")).toBe(variant("GitHub"));
  });
  it("stays within 1..n", () => {
    for (const t of ["GitHub", "Mastodon", "LinkedIn", "Email", "RSS", "Sep 2, 2026", "ünïcödé"]) {
      const v = variant(t);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(3);
      expect(variant(t, 5)).toBeLessThanOrEqual(5);
    }
  });
  it("spreads sample link texts across more than one variant", () => {
    const set = new Set(["GitHub", "Mastodon", "LinkedIn", "Email", "RSS"].map((t) => variant(t)));
    expect(set.size).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/hash.test.ts`
Expected: FAIL, cannot find module `../src/lib/hash`.

- [ ] **Step 3: Implement**

`src/lib/hash.ts`:
```ts
/** ×31 rolling hash over code points of the trimmed text, mod n, plus one → 1..n. */
export function variant(text: string, n = 3): number {
  let h = 0;
  for (const ch of text.trim()) {
    h = (Math.imul(h, 31) + (ch.codePointAt(0) ?? 0)) >>> 0;
  }
  return (h % n) + 1;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/hash.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/hash.ts tests/hash.test.ts
git commit -m "feat: variant hash for hand-drawn stroke selection"
```

---

### Task 3: Dates

**Files:**
- Create: `src/lib/dates.ts`
- Test: `tests/dates.test.ts`

**Interfaces:**
- Produces: `dateFromId(id: string): Date | undefined` (UTC midnight from the first 8 digits of `<digits>-…`), `isoDate(d)`, `fmtMonthYear(d)` → `Aug 2026`, `fmtDayMonth(d)` → `Aug 14`, `fmtFull(d)` → `Sep 2, 2026`, `fmtLong(d)` → `August 14, 2026`. All use UTC getters.

- [ ] **Step 1: Write the failing test**

`tests/dates.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { dateFromId, isoDate, fmtMonthYear, fmtDayMonth, fmtFull, fmtLong } from "../src/lib/dates";

describe("dateFromId", () => {
  it("reads YYYYMMDD from an 8-digit prefix", () => {
    expect(isoDate(dateFromId("20260814-types")!)).toBe("2026-08-14");
  });
  it("reads only the first 8 digits of a longer prefix", () => {
    expect(isoDate(dateFromId("202608141132001-types")!)).toBe("2026-08-14");
  });
  it("returns undefined without a prefix or with an invalid date", () => {
    expect(dateFromId("types")).toBeUndefined();
    expect(dateFromId("2026081-x")).toBeUndefined();
    expect(dateFromId("20261399-x")).toBeUndefined();
    expect(dateFromId("20260814types")).toBeUndefined();
  });
});

describe("formatters", () => {
  const d = new Date(Date.UTC(2026, 8, 2));
  it("formats", () => {
    expect(fmtMonthYear(d)).toBe("Sep 2026");
    expect(fmtDayMonth(d)).toBe("Sep 2");
    expect(fmtFull(d)).toBe("Sep 2, 2026");
    expect(fmtLong(new Date(Date.UTC(2026, 7, 14)))).toBe("August 14, 2026");
    expect(isoDate(d)).toBe("2026-09-02");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/dates.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

`src/lib/dates.ts`:
```ts
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Date (UTC midnight) from the leading YYYYMMDD of an id like `20260814-title` or `202608141132001-title`. */
export function dateFromId(id: string): Date | undefined {
  const m = /^(\d{4})(\d{2})(\d{2})\d*-/.exec(id);
  if (!m) return undefined;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d));
  const valid = date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
  return valid ? date : undefined;
}

const mon = (d: Date) => MONTHS[d.getUTCMonth()].slice(0, 3);

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
export const fmtMonthYear = (d: Date) => `${mon(d)} ${d.getUTCFullYear()}`;
export const fmtDayMonth = (d: Date) => `${mon(d)} ${d.getUTCDate()}`;
export const fmtFull = (d: Date) => `${mon(d)} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
export const fmtLong = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/dates.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/dates.ts tests/dates.test.ts
git commit -m "feat: date parsing from filenames and display formatters"
```

---

### Task 4: SVG helpers and markdown plugins (Sätteri)

**Files:**
- Create: `src/lib/markdown/svg.ts`, `src/lib/markdown/squiggle.ts`, `src/lib/markdown/code-copy.ts`, `src/lib/markdown/figures.ts`, `src/lib/markdown/blockquote.ts`, `src/lib/markdown/math.ts`, `src/lib/markdown/til-note.ts`, `src/lib/markdown/index.ts`
- Test: `tests/helpers.ts`, `tests/markdown.test.ts`

**Interfaces:**
- Consumes: `variant` from Task 2.
- Produces:
  - `svg.ts`: `CHEVRONS`, `BRACKETS`, `FRAME` path constants; `chevronSvg(v: number): string`, `bracketSvg(v: number): string`, `frameSvg(): string`, `clipboardSvg(): string`. All SVG strings carry `style="filter:url(#pencil)"` and `aria-hidden="true"` and use `stroke="currentColor"`.
  - `index.ts`: `features` (`{ gfm: true, smartPunctuation: true, math: true }`), `mdastPlugins` (`[math]`), `hastPlugins` (`[squiggle, codeCopy, figures, blockquote, tilNote]`).
  - Output contracts (used by CSS and scripts): links → `<a class="squig" data-squig="1|2|3">`; code → `<figure class="code" data-lang="…"><pre …/><button type="button" class="copy" aria-label="Copy code">SVG<span>Copy</span></button></figure>`; image paragraph → `<figure>[<img>][<figcaption>alt</figcaption>]</figure>`; image with title `framed` → `<figure class="framed"><div>FRAME_SVG<img></div>[<figcaption>]</figure>` (title attribute removed); blockquote → `<blockquote data-bracket="v">BRACKET_SVG…</blockquote>`; `$…$`/`$$…$$` → KaTeX HTML; the first paragraph of a file under `/content/til/` is removed.

Background facts for the implementer: Sätteri hast plugins are objects `{ name, element: { filter: [tagName], visit(node, ctx) } }`. Returning a new node from `visit` replaces the node; `ctx.replaceNode`, `ctx.wrapNode(node, parent)` (wrapped node becomes the parent's first child, declared children follow), `ctx.textContent(node)`, `ctx.parent(node)`, `ctx.fileURL` are available. Raw HTML children are `{ type: "raw", value }`. Astro runs its Shiki plugin before ours, so `pre` already has `class="astro-code"` and `data-language`. Do **not** enable the `rawHtml` feature: it drops the code language.

- [ ] **Step 1: Write `svg.ts`**

```ts
export const CHEVRONS = [
  "M6 3 C 9 6, 12 8, 15 10 C 12 12.5, 9 15, 6 17",
  "M5.5 3.5 C 9.5 6.5, 12.5 8.5, 14.5 10.2 C 12 12, 9 14.5, 6.5 16.5",
  "M6.5 2.8 C 9 5.5, 12.5 7.5, 15.5 9.8 C 12.5 12.5, 9.5 14.8, 5.8 17.2",
] as const;

export const BRACKETS = [
  "M14 3 C 6 30, 8 60, 12 90 S 8 115, 15 117",
  "M13 4 C 7 28, 9 58, 11 88 S 9 112, 14 116",
  "M15 2.5 C 8 32, 7 62, 13 92 S 7 114, 16 118",
] as const;

export const FRAME =
  "M8 7 C 200 3, 450 10, 752 6 C 755 80, 749 180, 753 273 C 500 270, 250 277, 6 272 C 9 190, 4 90, 8 7 Z";

const PENCIL = 'style="filter:url(#pencil)" aria-hidden="true"';
const pick = <T,>(arr: readonly T[], v: number): T => arr[Math.min(Math.max(v, 1), arr.length) - 1];

export function chevronSvg(v: number): string {
  return `<svg class="chevron" viewBox="0 0 20 20" ${PENCIL}><path d="${pick(CHEVRONS, v)}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

export function bracketSvg(v: number): string {
  return `<svg class="bracket" viewBox="0 0 20 120" preserveAspectRatio="none" ${PENCIL}><path d="${pick(BRACKETS, v)}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;
}

export function frameSvg(): string {
  return `<svg class="frame" viewBox="0 0 760 280" preserveAspectRatio="none" ${PENCIL}><path d="${FRAME}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
}

export function clipboardSvg(): string {
  return `<svg class="clip" viewBox="0 0 20 20" width="14" height="14" ${PENCIL}><path d="M7.2 4.2 C 9 3.7, 11 3.7, 12.8 4.2 L 13 6.2 L 7 6.2 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 5.4 C 4.9 9.5, 4.9 13.5, 5.2 17.4 C 8.3 17.7, 11.7 17.7, 15 17.3 C 15.2 13.4, 15.1 9.4, 14.9 5.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;
}
```

- [ ] **Step 2: Write the test helper and failing tests**

`tests/helpers.ts`:
```ts
import { markdownToHtml } from "satteri";
import { features, mdastPlugins, hastPlugins } from "../src/lib/markdown/index";

/** Render markdown the way the site does, minus Astro's Shiki step. */
export function md(src: string, opts: { fileURL?: URL } = {}): string {
  const result = markdownToHtml(src, { features, mdastPlugins, hastPlugins, ...opts });
  if (result instanceof Promise) throw new Error("plugins must be synchronous");
  return result.html;
}
```

`tests/markdown.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { md } from "./helpers";
import { variant } from "../src/lib/hash";

describe("squiggle", () => {
  it("adds class and a stable variant from the link text", () => {
    const html = md("See [the docs](http://x) now.");
    expect(html).toContain(`<a href="http://x" class="squig" data-squig="${variant("the docs")}">the docs</a>`);
  });
  it("skips links with no text", () => {
    expect(md("[](http://x)")).not.toContain("squig");
  });
});

describe("code-copy", () => {
  it("wraps pre in a figure with the language and a copy button", () => {
    const html = md("```crystal\nputs 1\n```");
    expect(html).toMatch(/<figure class="code" data-lang="crystal"><pre[\s\S]*<\/pre><button type="button" class="copy" aria-label="Copy code"><svg class="clip"[\s\S]*<span>Copy<\/span><\/button><\/figure>/);
  });
});

describe("figures", () => {
  it("turns an image paragraph into a figure with caption from alt", () => {
    expect(md("![A caption](pic.png)")).toBe('<figure><img src="pic.png" alt="A caption"><figcaption>A caption</figcaption></figure>\n');
  });
  it("omits the caption when alt is empty", () => {
    expect(md("![](pic.png)")).toBe('<figure><img src="pic.png" alt=""></figure>\n');
  });
  it("frames when the title is framed and drops the title", () => {
    const html = md('![Fig](pic.png "framed")');
    expect(html).toMatch(/^<figure class="framed"><div><svg class="frame"[\s\S]*<\/svg><img src="pic.png" alt="Fig"><\/div><figcaption>Fig<\/figcaption><\/figure>\n$/);
    expect(html).not.toContain("title=");
  });
  it("leaves paragraphs with text alone", () => {
    expect(md("Look ![x](pic.png) here")).toContain("<p>Look <img");
  });
});

describe("blockquote", () => {
  it("prepends a bracket chosen by the quote text", () => {
    const html = md("> Be kind.\n> Really.");
    const v = variant("Be kind.\nReally.");
    expect(html).toMatch(new RegExp(`^<blockquote data-bracket="${v}"><svg class="bracket"[\\s\\S]*</svg>\\n?<p>Be kind.\\nReally.</p>`));
  });
});

describe("math", () => {
  it("renders inline and display math with KaTeX", () => {
    const html = md("Energy $E=mc^2$.\n\n$$\nx^2\n$$");
    expect(html).toContain('<span class="katex">');
    expect(html).toContain('<span class="katex-display">');
    expect(html).not.toContain("language-math");
  });
});

describe("til-note", () => {
  const til = new URL("file:///repo/content/til/20260902-git.md");
  it("strips the first paragraph of TIL files", () => {
    const html = md("The one-liner.\n\nThe note.", { fileURL: til });
    expect(html).not.toContain("one-liner");
    expect(html).toContain("<p>The note.</p>");
  });
  it("leaves other files alone", () => {
    const html = md("First.\n\nSecond.", { fileURL: new URL("file:///repo/content/writing/20260101-a.md") });
    expect(html).toContain("<p>First.</p>");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run tests/markdown.test.ts`
Expected: FAIL, module `../src/lib/markdown/index` not found.

- [ ] **Step 4: Write the plugins**

`src/lib/markdown/squiggle.ts`:
```ts
import { defineHastPlugin } from "satteri";
import { variant } from "../hash";

export const squiggle = defineHastPlugin({
  name: "squiggle",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      const text = ctx.textContent(node).trim();
      if (!text) return;
      const existing = node.properties.className;
      const classes = Array.isArray(existing) ? existing.map(String) : [];
      return {
        ...node,
        properties: { ...node.properties, className: [...classes, "squig"], dataSquig: String(variant(text)) },
      };
    },
  },
});
```

`src/lib/markdown/code-copy.ts`:
```ts
import { defineHastPlugin } from "satteri";
import { clipboardSvg } from "./svg";

export const codeCopy = defineHastPlugin({
  name: "code-copy",
  element: {
    filter: ["pre"],
    visit(node, ctx) {
      // Astro's Shiki step sets data-language; before it runs (or in tests) fall back to the code child's language-* class.
      const code = node.children.find((c) => c.type === "element" && c.tagName === "code");
      const classes = code && code.type === "element" && Array.isArray(code.properties.className)
        ? code.properties.className.map(String)
        : [];
      const fromClass = classes.find((c) => c.startsWith("language-"))?.slice("language-".length) ?? "";
      const lang = String(node.properties.dataLanguage ?? fromClass);
      ctx.wrapNode(node, {
        type: "element",
        tagName: "figure",
        properties: { className: ["code"], dataLang: lang },
        children: [
          {
            type: "element",
            tagName: "button",
            properties: { type: "button", className: ["copy"], ariaLabel: "Copy code" },
            children: [
              { type: "raw", value: clipboardSvg() },
              { type: "element", tagName: "span", properties: {}, children: [{ type: "text", value: "Copy" }] },
            ],
          },
        ],
      } as never);
    },
  },
});
```

Note on `as never`: Sätteri's wrapper type is stricter than hast's `Element`; the cast keeps the object literal readable. If the installed Sätteri version accepts the literal without it, drop the cast.

`src/lib/markdown/figures.ts`:
```ts
import { defineHastPlugin } from "satteri";
import type { Element } from "hast";
import { frameSvg } from "./svg";

export const figures = defineHastPlugin({
  name: "figures",
  element: {
    filter: ["p"],
    visit(node, ctx) {
      const kids = node.children.filter((c) => !(c.type === "text" && c.value.trim() === ""));
      if (kids.length !== 1) return;
      const img = kids[0];
      if (img.type !== "element" || img.tagName !== "img") return;

      const framed = img.properties.title === "framed";
      const alt = String(img.properties.alt ?? "");
      const { title: _title, ...rest } = img.properties;
      const image: Element = { ...img, properties: framed ? rest : img.properties };

      const children: unknown[] = framed
        ? [{ type: "element", tagName: "div", properties: {}, children: [{ type: "raw", value: frameSvg() }, image] }]
        : [image];
      if (alt) {
        children.push({ type: "element", tagName: "figcaption", properties: {}, children: [{ type: "text", value: alt }] });
      }
      ctx.replaceNode(node, {
        type: "element",
        tagName: "figure",
        properties: framed ? { className: ["framed"] } : {},
        children,
      } as never);
    },
  },
});
```

`src/lib/markdown/blockquote.ts`:
```ts
import { defineHastPlugin } from "satteri";
import { variant } from "../hash";
import { bracketSvg } from "./svg";

export const blockquote = defineHastPlugin({
  name: "blockquote",
  element: {
    filter: ["blockquote"],
    visit(node, ctx) {
      const v = variant(ctx.textContent(node));
      ctx.replaceNode(node, {
        type: "element",
        tagName: "blockquote",
        properties: { ...node.properties, dataBracket: String(v) },
        children: [{ type: "raw", value: bracketSvg(v) }, ...node.children],
      } as never);
    },
  },
});
```

`src/lib/markdown/math.ts`:
```ts
import { defineMdastPlugin } from "satteri";
import katex from "katex";

const render = (tex: string, displayMode: boolean) =>
  katex.renderToString(tex, { displayMode, throwOnError: false, output: "htmlAndMathml" });

export const math = defineMdastPlugin({
  name: "math",
  math(node, ctx) {
    ctx.replaceNode(node, { type: "html", value: render(node.value, true) });
  },
  inlineMath(node, ctx) {
    ctx.replaceNode(node, { type: "html", value: render(node.value, false) });
  },
});
```

`src/lib/markdown/til-note.ts`:
```ts
import { defineHastPlugin, type PluginFactoryContext } from "satteri";

/** For files under content/til/, drop the first top-level paragraph (the one-liner shown in lists). */
export function tilNote(factory: PluginFactoryContext) {
  if (!factory.fileURL?.pathname.includes("/content/til/")) return null;
  let done = false;
  return defineHastPlugin({
    name: "til-note",
    element: {
      filter: ["p"],
      visit(node, ctx) {
        if (done) return;
        if (ctx.parent(node)?.type !== "root") return;
        done = true;
        ctx.removeNode(node);
      },
    },
  });
}
```

`src/lib/markdown/index.ts`:
```ts
import { math } from "./math";
import { squiggle } from "./squiggle";
import { codeCopy } from "./code-copy";
import { figures } from "./figures";
import { blockquote } from "./blockquote";
import { tilNote } from "./til-note";

export const features = { gfm: true, smartPunctuation: true, math: true } as const;
export const mdastPlugins = [math];
export const hastPlugins = [squiggle, codeCopy, figures, blockquote, tilNote];
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/markdown.test.ts`
Expected: PASS. If `PluginFactoryContext` is not exported by the installed Sätteri, type the parameter as `{ fileURL: URL | undefined }` instead. If smart punctuation turns the test's straight quotes into curly ones, the affected assertions compare text without quotes, so nothing should break; if the blockquote test fails on the newline between `</svg>` and `<p>`, keep the `\n?` in the regex.

- [ ] **Step 6: Commit**

```bash
git add src/lib/markdown tests/helpers.ts tests/markdown.test.ts
git commit -m "feat: satteri markdown plugins (squiggle, code copy, figures, bracket, math, til note)"
```

---

### Task 5: Inline renderer, Shiki theme, and Astro markdown config

**Files:**
- Create: `src/lib/markdown/inline.ts`, `src/lib/shiki-flexoki.ts`
- Modify: `astro.config.mjs`
- Test: `tests/inline.test.ts`

**Interfaces:**
- Produces: `renderInline(md: string): string` (HTML without outer `<p>`), `plainText(md: string): string` (tags stripped); `flexokiLight`, `flexokiDark` Shiki theme objects; Astro configured with Sätteri + plugins + dual-theme Shiki.

- [ ] **Step 1: Write the failing test**

`tests/inline.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { renderInline, plainText } from "../src/lib/markdown/inline";

describe("renderInline", () => {
  it("renders inline markdown without a wrapping paragraph", () => {
    const html = renderInline("Hi [x](http://a) and `b`.");
    expect(html.startsWith("<p>")).toBe(false);
    expect(html).toContain('<a href="http://a" class="squig" data-squig=');
    expect(html).toContain("<code>b</code>");
  });
  it("renders inline math", () => {
    expect(renderInline("$n^2$")).toContain('class="katex"');
  });
  it("plainText strips tags", () => {
    expect(plainText("Elm's `Debug.todo` is [fine](http://x)")).toBe("Elm’s Debug.todo is fine");
  });
});
```

(The curly apostrophe in the last expectation comes from smart punctuation, which is on.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/inline.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `inline.ts`**

```ts
import { markdownToHtml } from "satteri";
import { features, mdastPlugins } from "./index";
import { squiggle } from "./squiggle";

/** Render a one-paragraph markdown string to inline HTML (no outer <p>). */
export function renderInline(md: string): string {
  const result = markdownToHtml(md.trim(), { features, mdastPlugins, hastPlugins: [squiggle] });
  if (result instanceof Promise) throw new Error("inline markdown plugins must be synchronous");
  return result.html.trim().replace(/^<p>/, "").replace(/<\/p>$/, "");
}

/** Plain text of a one-paragraph markdown string, for <title> and RSS titles. */
export function plainText(md: string): string {
  return renderInline(md).replace(/<[^>]+>/g, "");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/inline.test.ts`
Expected: PASS. If the apostrophe assertion fails because it is rendered as `&#x27;` or similar, change `plainText` to also decode `&#39;`/`&#x27;` → `'`, `&amp;` → `&`, `&lt;` → `<`, `&gt;` → `>`, `&quot;` → `"` and update the expectation to the decoded form.

- [ ] **Step 5: Write the Shiki theme**

`src/lib/shiki-flexoki.ts`:
```ts
import type { ThemeRegistrationRaw } from "shiki";

type Hues = {
  red: string; orange: string; yellow: string; green: string;
  cyan: string; blue: string; purple: string; magenta: string;
  fg: string; muted: string; bg: string;
};

const light: Hues = {
  red: "#AF3029", orange: "#BC5215", yellow: "#AD8301", green: "#66800B",
  cyan: "#24837B", blue: "#205EA6", purple: "#5E409D", magenta: "#A02F6F",
  fg: "#282726", muted: "#6F6E69", bg: "#F2F0E5",
};

const dark: Hues = {
  red: "#D14D41", orange: "#DA702C", yellow: "#D0A215", green: "#879A39",
  cyan: "#3AA99F", blue: "#4385BE", purple: "#8B7EC8", magenta: "#CE5D97",
  fg: "#CECDC3", muted: "#878580", bg: "#1C1B1A",
};

function theme(name: string, type: "light" | "dark", h: Hues): ThemeRegistrationRaw {
  return {
    name,
    type,
    colors: { "editor.background": h.bg, "editor.foreground": h.fg },
    tokenColors: [
      { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: h.orange, fontStyle: "italic" } },
      { scope: ["keyword", "storage", "storage.type", "keyword.control"], settings: { foreground: h.purple } },
      { scope: ["string", "string.quoted", "punctuation.definition.string"], settings: { foreground: h.green } },
      { scope: ["constant.numeric", "constant.language", "constant.character"], settings: { foreground: h.magenta } },
      { scope: ["entity.name.function", "support.function", "meta.function-call"], settings: { foreground: h.blue } },
      { scope: ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.name.namespace"], settings: { foreground: h.yellow } },
      { scope: ["variable.parameter", "variable.other", "variable"], settings: { foreground: h.fg } },
      { scope: ["keyword.operator", "punctuation"], settings: { foreground: h.muted } },
      { scope: ["entity.name.tag", "meta.tag"], settings: { foreground: h.cyan } },
      { scope: ["invalid", "invalid.illegal"], settings: { foreground: h.red } },
      { scope: ["markup.heading", "markup.bold"], settings: { fontStyle: "bold" } },
      { scope: ["markup.italic"], settings: { fontStyle: "italic" } },
    ],
  };
}

export const flexokiLight = theme("flexoki-light", "light", light);
export const flexokiDark = theme("flexoki-dark", "dark", dark);
```

- [ ] **Step 6: Configure Astro**

`astro.config.mjs`:
```js
import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import { features, mdastPlugins, hastPlugins } from "./src/lib/markdown/index.ts";
import { flexokiLight, flexokiDark } from "./src/lib/shiki-flexoki.ts";

export default defineConfig({
  site: "https://www.bcardiff.com",
  markdown: {
    processor: satteri({ features, mdastPlugins, hastPlugins }),
    shikiConfig: {
      themes: { light: flexokiLight, dark: flexokiDark },
      defaultColor: false,
    },
  },
});
```

- [ ] **Step 7: Verify the build still works**

Run: `npm run build`
Expected: builds `dist/index.html` with no warnings about markdown plugins.

- [ ] **Step 8: Commit**

```bash
git add src/lib/markdown/inline.ts src/lib/shiki-flexoki.ts astro.config.mjs tests/inline.test.ts
git commit -m "feat: inline markdown renderer, flexoki shiki theme, satteri config"
```

---

### Task 6: Content collections, site config, helpers, and seed content

**Files:**
- Create: `src/content.config.ts`, `src/lib/entries.ts`, `src/lib/til.ts`, `src/lib/site.ts`, `src/lib/collections.ts`
- Create: `content/site.yaml`, `content/cv/noredink.md`, `content/cv/uba.md`, `content/cv/crystal.md`, `content/writing/20260814-types-conversation.md`, `content/writing/20260603-twelve-years.md`, `content/writing/20260319-grading-repl.md`, `content/til/20260902-git-range-diff.md`, `content/til/20260828-let-it-crash.md`, `content/til/20251212-debug-todo.md`, `content/til/20251103-odd-numbers.md`, `content/til/20250915-between.md`, `content/til/20260905-draft-check.md`
- Test: `tests/entries.test.ts`, `tests/til.test.ts`, `tests/site.test.ts`

**Interfaces:**
- Produces:
  - `entries.ts`: `assertUniqueSlugs(collection: string, entries: { id: string; filePath?: string; data: { slug: string } }[]): void`, `resolveDate(entry: { id: string; filePath?: string; data: { date?: Date } }): Date`, `byDateDesc(a, b)`.
  - `til.ts`: `splitTil(body: string): { line: string; note: string | null }`.
  - `site.ts`: `SiteSchema`, `type Site`, `site` (parsed `content/site.yaml`): `{ name, kicker, headline, highlight?, bio, photo?, presence: {label, href}[], author_line }`.
  - `collections.ts`: `type Post = CollectionEntry<"writing"> & { date: Date; url: string }`, `type Til = CollectionEntry<"til"> & { date: Date; line: string; note: string | null; url: string }`, `type CvEntry = CollectionEntry<"cv">`, `getWriting(): Promise<Post[]>` (newest first), `getTils(): Promise<Til[]>` (newest first), `getCv(): Promise<CvEntry[]>` (by `from` desc).

- [ ] **Step 1: Write the failing tests**

`tests/entries.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { assertUniqueSlugs, resolveDate, byDateDesc } from "../src/lib/entries";

describe("assertUniqueSlugs", () => {
  it("passes when slugs are unique", () => {
    expect(() => assertUniqueSlugs("writing", [
      { id: "20260101-a", data: { slug: "a" } },
      { id: "20260102-b", data: { slug: "b" } },
    ])).not.toThrow();
  });
  it("throws naming both files", () => {
    expect(() => assertUniqueSlugs("writing", [
      { id: "20260101-a", filePath: "content/writing/20260101-a.md", data: { slug: "same" } },
      { id: "20260102-b", filePath: "content/writing/20260102-b.md", data: { slug: "same" } },
    ])).toThrow(/Duplicate slug "same" in writing: content\/writing\/20260101-a\.md and content\/writing\/20260102-b\.md/);
  });
});

describe("resolveDate", () => {
  it("prefers frontmatter date", () => {
    const d = new Date(Date.UTC(2020, 0, 1));
    expect(resolveDate({ id: "20260101-a", data: { date: d } })).toBe(d);
  });
  it("falls back to the filename prefix", () => {
    expect(resolveDate({ id: "20260814-a", data: {} }).toISOString()).toBe("2026-08-14T00:00:00.000Z");
  });
  it("throws when neither is available", () => {
    expect(() => resolveDate({ id: "a", filePath: "content/til/a.md", data: {} })).toThrow(/content\/til\/a\.md/);
  });
});

describe("byDateDesc", () => {
  it("sorts newest first", () => {
    const items = [{ date: new Date(2020, 0, 1) }, { date: new Date(2021, 0, 1) }];
    expect(items.sort(byDateDesc)[0].date.getFullYear()).toBe(2021);
  });
});
```

`tests/til.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { splitTil } from "../src/lib/til";

describe("splitTil", () => {
  it("returns the whole body as the line when there is one paragraph", () => {
    expect(splitTil("\nJust a line.\n")).toEqual({ line: "Just a line.", note: null });
  });
  it("splits at the first blank line", () => {
    expect(splitTil("Line one.\n\nNote para 1.\n\nNote para 2.")).toEqual({ line: "Line one.", note: "Note para 1.\n\nNote para 2." });
  });
  it("treats a blank line with spaces as a separator", () => {
    expect(splitTil("Line.\n   \nNote.")).toEqual({ line: "Line.", note: "Note." });
  });
  it("keeps a wrapped one-liner together", () => {
    expect(splitTil("Line that\nwraps.")).toEqual({ line: "Line that\nwraps.", note: null });
  });
});
```

`tests/site.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { SiteSchema, site } from "../src/lib/site";

describe("site.yaml", () => {
  it("loads and validates the real file", () => {
    expect(site.name).toBe("Brian J. Cardiff");
    expect(site.presence.length).toBeGreaterThan(0);
  });
  it("rejects a highlight that is not part of the headline", () => {
    const bad = { ...site, highlight: "nope" };
    expect(() => SiteSchema.parse(bad)).toThrow(/highlight/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/entries.test.ts tests/til.test.ts tests/site.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the pure helpers**

`src/lib/entries.ts`:
```ts
import { dateFromId } from "./dates";

interface Sluggable { id: string; filePath?: string; data: { slug: string } }
interface Dated { id: string; filePath?: string; data: { date?: Date } }

const where = (e: { id: string; filePath?: string }) => e.filePath ?? e.id;

export function assertUniqueSlugs(collection: string, entries: Sluggable[]): void {
  const seen = new Map<string, Sluggable>();
  for (const e of entries) {
    const prev = seen.get(e.data.slug);
    if (prev) {
      throw new Error(`Duplicate slug "${e.data.slug}" in ${collection}: ${where(prev)} and ${where(e)}`);
    }
    seen.set(e.data.slug, e);
  }
}

export function resolveDate(entry: Dated): Date {
  const d = entry.data.date ?? dateFromId(entry.id);
  if (!d) {
    throw new Error(`${where(entry)}: no date in frontmatter and filename does not start with YYYYMMDD`);
  }
  return d;
}

export const byDateDesc = <T extends { date: Date }>(a: T, b: T) => b.date.getTime() - a.date.getTime();
```

`src/lib/til.ts`:
```ts
/** Split a TIL body into the one-liner (first paragraph) and the optional note (the rest). */
export function splitTil(body: string): { line: string; note: string | null } {
  const text = body.trim();
  const m = /\n[ \t]*\n/.exec(text);
  if (!m) return { line: text, note: null };
  const line = text.slice(0, m.index).trim();
  const note = text.slice(m.index + m[0].length).trim();
  return { line, note: note || null };
}
```

`src/lib/site.ts`:
```ts
import { readFileSync } from "node:fs";
import yaml from "js-yaml";
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

export function loadSite(url = new URL("../../content/site.yaml", import.meta.url)): Site {
  return SiteSchema.parse(yaml.load(readFileSync(url, "utf8")));
}

export const site = loadSite();
```

- [ ] **Step 4: Write the seed content**

`content/site.yaml`:
```yaml
name: Brian J. Cardiff
kicker: Software Engineer · Adjunct Professor of Computer Science
headline: Working, teaching, and coding in the open
highlight: coding in the open
bio: >-
  I build software at NoRedInk and teach programming paradigms at
  Universidad de Buenos Aires, where I also do research on how people learn
  to think in different languages. Since 2013 I have been part of the core
  team of an open source compiler. I write essays about languages, teaching
  and maintaining software, and keep a stream of short notes on what I learn
  along the way.
# photo: photo.jpg   # uncomment and drop the file in content/ to show the framed photo
presence:
  - { label: GitHub, href: https://github.com/bcardiff }
  - { label: Mastodon, href: https://mastodon.social/@bcardiff }   # placeholder handle, author to confirm
  - { label: LinkedIn, href: https://www.linkedin.com/in/bcardiff }   # placeholder, author to confirm
  - { label: Email, href: mailto:bcardiff@gmail.com }
  - { label: RSS, href: /rss.xml }
author_line: >-
  **Brian J. Cardiff** builds software at NoRedInk and teaches programming
  paradigms at Universidad de Buenos Aires. Replies welcome on
  [Mastodon](https://mastodon.social/@bcardiff) or by
  [email](mailto:bcardiff@gmail.com).
```

`content/cv/noredink.md`:
```markdown
---
from: 2023
---
Software engineer, [NoRedInk](https://www.noredink.com)
```

`content/cv/uba.md`:
```markdown
---
from: 2014
---
Adjunct Professor, Programming Paradigms, [Universidad de Buenos Aires](https://www.uba.ar)
```

`content/cv/crystal.md`:
```markdown
---
from: 2013
---
Core team, an open source compiled language
```

`content/writing/20260814-types-conversation.md`:
```markdown
---
slug: types-as-a-conversation
title: Types as a conversation, not a contract
kind: essay
status: published
tags: [types, teaching, compilers]
dek: What teaching type systems to second-year students changed about how I read compiler errors.
---

Every year I stand in front of eighty students and tell them that a type checker is a tool that helps them. Every year, by week three, most of them have concluded the opposite. The compiler is a gatekeeper. It says no. It says no in a language they do not yet speak, and it says no about code that, as far as they can tell, is obviously correct.

For a long time I thought this was a presentation problem. Better error messages, friendlier tooling, a gentler first week. Some of that helps. But the students who eventually make peace with the type checker do not do so because the messages got nicer. They do so because they stop reading the messages as verdicts and start reading them as [questions](https://en.wikipedia.org/wiki/Type_inference).

## The contract reading

The usual framing goes like this. A type signature is a contract. The caller promises to provide certain things, the function promises to return certain things, and the checker enforces the deal. This is accurate, and it is also the framing that produces the gatekeeper experience, because contracts are things you either satisfy or violate.

![Fig. 1 — The checker as gate vs. the checker as a second reader.](gate-vs-reader.png "framed")

Consider what a student actually sees when they write a function that folds over a list and get back four lines about an expected `Int` and a found `List Int`. Under the contract reading, they have broken a rule. Under the other reading, the checker has noticed something about their code that they had not, and is pointing at it.

> The compiler is not telling you that you are wrong. It is telling you what it understood, and asking whether that is what you meant.

## Reading errors as questions

Here is the exercise I now run in week three. Students bring an error they cannot resolve. Before anyone touches the code, we rewrite the message as a question the compiler is asking. The four lines above become: *you told me this returns a number; the last thing you do produces a list; which did you mean?*

```haskell
sum : List Int -> Int
sum xs =
  List.foldl (\x acc -> x :: acc) [] xs
  -- ^ expected Int, found List Int
```

It is a small reframing, and it does not change what the students must do next. What changes is who they think they are arguing with. The contract reading puts the compiler across the table. The conversation reading puts it on the same side, looking at the same code.

I have started to read my own errors this way too, twelve years into maintaining a compiler that produces them. It turns out the habit is not about students at all.
```

Also create `content/writing/gate-vs-reader.png` so the framed figure has a real image. The old site's panda drawing stands in as the placeholder:

```bash
cp source/dibujos/panda.png content/writing/gate-vs-reader.png
```

`content/writing/20260603-twelve-years.md`:
```markdown
---
slug: twelve-years-maintaining-a-compiler
title: Twelve years of maintaining an open source compiler
kind: essay
status: published
tags: [compilers, maintaining]
dek: Notes on release cadence, contributor churn and the parts nobody wants to own.
---

Placeholder body. A release every three months sounds relaxed until you count the weeks that go to the changelog, the regression suite, and the two platforms nobody on the team uses daily.

## Cadence

Placeholder paragraph about cadence. The trick is to make the release itself boring, so the interesting work can stay interesting.

```crystal
def release(version : String) : Nil
  # tag, build, publish
  puts "releasing #{version}"
end
```

## The parts nobody wants to own

Placeholder paragraph. Every project has a corner that is load-bearing and unloved.
```

`content/writing/20260319-grading-repl.md`:
```markdown
---
slug: grading-with-a-repl
title: Grading with a REPL
kind: blog
status: published
tags: [teaching, prolog]
dek: A small tool, a large classroom, and what feedback loops do to motivation.
---

Placeholder body. The autograder started as a Prolog REPL with a timeout and grew a web front end when the queue got long.

```prolog
grade(Submission, Score) :-
    run_tests(Submission, Results),
    count_passed(Results, Score).
```

Placeholder closing paragraph.
```

`content/til/20260902-git-range-diff.md`:
```markdown
---
slug: git-range-diff
status: published
tags: [git]
---

`git range-diff` compares two versions of a patch series. Exactly what rebase reviews need.

Given two ranges, it pairs commits by similarity and shows the diff of the diffs:

```shell
git range-diff main..feature@{1} main..feature
```

Commits that only changed their message show up as `=` with a small metadata diff, which is what makes it useful after a rebase.
```

`content/til/20260828-let-it-crash.md`:
```markdown
---
slug: let-it-crash
status: published
tags: [erlang, teaching]
---

Erlang's *let it crash* reads differently once you have graded 80 exception-handling exercises.
```

`content/til/20251212-debug-todo.md`:
```markdown
---
slug: debug-todo
status: published
tags: [elm, teaching]
---

Elm's `Debug.todo` is a fine teaching device for typed holes.

The compiler accepts `Debug.todo "later"` anywhere an expression is expected, so students can sketch the shape of a function, get it to type check, and fill the holes one by one. The build refuses to ship while any remain.
```

`content/til/20251103-odd-numbers.md`:
```markdown
---
slug: sum-of-odd-numbers
status: published
tags: [math, teaching]
---

The sum of the first $n$ odd numbers is $n^2$, which makes a nice one-line induction exercise.
```

`content/til/20250915-between.md`:
```markdown
---
slug: prolog-between
status: published
tags: [prolog]
---

Prolog's `between/3` enumerates naturals lazily, so `between(1, inf, N)` is safe to explore in a REPL.
```

`content/til/20260905-draft-check.md`:
```markdown
---
slug: draft-check
status: draft
tags: [meta]
---

Draft TIL: visible in `astro dev`, absent from production builds.
```

- [ ] **Step 5: Run the pure tests**

Run: `npx vitest run`
Expected: PASS for entries, til, site, plus earlier suites.

- [ ] **Step 6: Define the collections and the Astro-side helpers**

`src/content.config.ts`:
```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

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
```

`src/lib/collections.ts`:
```ts
import { getCollection, type CollectionEntry } from "astro:content";
import { assertUniqueSlugs, resolveDate, byDateDesc } from "./entries";
import { splitTil } from "./til";

export type Post = CollectionEntry<"writing"> & { date: Date; url: string };
export type Til = CollectionEntry<"til"> & { date: Date; line: string; note: string | null; url: string };
export type CvEntry = CollectionEntry<"cv">;

const visible = (e: { data: { status: "draft" | "published" } }) =>
  import.meta.env.DEV || e.data.status === "published";

export async function getWriting(): Promise<Post[]> {
  const entries = (await getCollection("writing")).filter(visible);
  assertUniqueSlugs("writing", entries);
  return entries
    .map((e) => ({ ...e, date: resolveDate(e), url: `/writing/${e.data.slug}/` }))
    .sort(byDateDesc);
}

export async function getTils(): Promise<Til[]> {
  const entries = (await getCollection("til")).filter(visible);
  assertUniqueSlugs("til", entries);
  return entries
    .map((e) => {
      const { line, note } = splitTil(e.body ?? "");
      const url = note ? `/til/${e.data.slug}/` : `/til/#${e.data.slug}`;
      return { ...e, date: resolveDate(e), line, note, url };
    })
    .sort(byDateDesc);
}

export async function getCv(): Promise<CvEntry[]> {
  return (await getCollection("cv")).sort((a, b) => b.data.from - a.data.from);
}
```

- [ ] **Step 7: Smoke-test the collections through a temporary page**

Replace `src/pages/index.astro` with:
```astro
---
import { getWriting, getTils, getCv } from "../lib/collections";
const posts = await getWriting();
const tils = await getTils();
const cv = await getCv();
---
<html lang="en"><head><meta charset="utf-8" /><title>smoke</title></head><body>
<ul id="posts">{posts.map((p) => <li>{p.url} {p.data.title} {p.date.toISOString()}</li>)}</ul>
<ul id="tils">{tils.map((t) => <li>{t.url} | {t.line} | {t.note ? "note" : "no note"}</li>)}</ul>
<ul id="cv">{cv.map((c) => <li>{c.data.from} {c.body}</li>)}</ul>
</body></html>
```

Run: `npm run build && grep -c "<li>" dist/index.html && grep -o 'draft-check' dist/index.html | wc -l && npm run check`
Expected: 3 posts + 5 TILs + 3 CV rows = 11 `<li>`; `draft-check` count is 0 (draft excluded); `astro check` reports 0 errors. Then run `npx astro dev --background && sleep 4 && curl -s localhost:4321/ | grep -c draft-check; npx astro dev stop` and expect 1 (draft visible in dev). If the dev server picks another port, read it from `npx astro dev logs`.

- [ ] **Step 8: Verify the duplicate-slug guard fails the build**

```bash
cp content/til/20250915-between.md content/til/20250916-dupe.md
npm run build; echo "exit=$?"
rm content/til/20250916-dupe.md
```
Expected: build fails with `Duplicate slug "prolog-between" in til: content/til/20250915-between.md and content/til/20250916-dupe.md`, exit code non-zero.

- [ ] **Step 9: Commit**

```bash
git add src/content.config.ts src/lib content tests src/pages/index.astro
git commit -m "feat: content collections, site config, and seed content"
```

---

### Task 7: Base layout, navigation, theme toggle, and stylesheet foundation

**Files:**
- Create: `src/layouts/Base.astro`, `src/components/Nav.astro`, `src/components/ThemeToggle.astro`, `src/components/MenuToggle.astro`, `src/styles/site.css`
- Modify: `src/pages/index.astro` (temporary content using Base)

**Interfaces:**
- Consumes: `site` from `src/lib/site.ts`.
- Produces: `Base.astro` props `{ page: "home" | "article" | "index"; title?: string; description?: string; section?: "writing" | "til" }`. Renders `<html lang="en">`, head with fonts, KaTeX CSS, `site.css`, theme bootstrap script, RSS link; body `class={page}` with the `#pencil` filter defs, `<header class="site"><nav>…</nav></header>`, `<main><slot/></main>`.
- Nav markup: `<nav aria-label="Site"><a class="name" href="/">…</a><div class="controls"><button class="theme">…</button><button class="menu" hidden>…</button></div><ul id="site-menu"><li><a href="/writing/" aria-current="page"?>Writing</a></li><li><a href="/til/">TIL</a></li></ul></nav>`. `.menu-open` on `nav` shows the list on mobile.

- [ ] **Step 1: Write `ThemeToggle.astro`**

```astro
---
---
<button type="button" class="theme" aria-label="Toggle dark mode" title="Toggle dark mode">
  <svg viewBox="0 0 24 24" width="18" height="18" style="filter:url(#pencil)" aria-hidden="true">
    <path d="M12 3 C 7 3.2, 3.4 7.4, 3.6 12.2 S 7.6 20.8, 12.4 20.6 S 20.8 16.4, 20.6 11.6 S 16.8 3, 12 3 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M12 3.4 C 12.3 9, 11.8 15, 12.2 20.4 C 16.8 20, 20.4 16.2, 20.4 12 S 16.6 3.6, 12 3.4 Z" fill="currentColor" stroke="none" opacity=".85"/>
  </svg>
</button>
<script>
  const root = document.documentElement;
  const isDark = () =>
    root.dataset.theme === "dark" ||
    (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  document.querySelector("button.theme")?.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("bjc-theme", next);
    } catch {}
  });
</script>
```

- [ ] **Step 2: Write `MenuToggle.astro`**

```astro
---
---
<button type="button" class="menu" aria-label="Menu" aria-expanded="false" aria-controls="site-menu" hidden>
  <svg viewBox="0 0 24 24" width="22" height="22" style="filter:url(#pencil)" aria-hidden="true">
    <path d="M3 6.5 C 9 6, 15 6.8, 21 6.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M3.5 12.2 C 9 11.6, 15 12.4, 20.5 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M3 17.8 C 9 17.3, 15 18.1, 21 17.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
  </svg>
</button>
<script>
  const btn = document.querySelector<HTMLButtonElement>("button.menu");
  const nav = btn?.closest("nav");
  if (btn && nav) {
    btn.hidden = false;
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("menu-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  }
</script>
```

The button starts `hidden` so that without JavaScript the nav list stays visible (CSS below uses `nav:has(button.menu[hidden])`).

- [ ] **Step 3: Write `Nav.astro`**

```astro
---
import ThemeToggle from "./ThemeToggle.astro";
import MenuToggle from "./MenuToggle.astro";
import { site } from "../lib/site";

interface Props { section?: "writing" | "til" }
const { section } = Astro.props;
const links = [
  { href: "/writing/", label: "Writing", key: "writing" },
  { href: "/til/", label: "TIL", key: "til" },
] as const;
---
<nav aria-label="Site">
  <a class="name" href="/">{site.name}</a>
  <div class="controls"><ThemeToggle /><MenuToggle /></div>
  <ul id="site-menu">
    {links.map((l) => (
      <li><a href={l.href} aria-current={section === l.key ? "page" : undefined}>{l.label}</a></li>
    ))}
  </ul>
</nav>
```

- [ ] **Step 4: Write `Base.astro`**

```astro
---
import "@fontsource/lora/400.css";
import "@fontsource/lora/400-italic.css";
import "@fontsource/lora/500.css";
import "@fontsource/lora/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "katex/dist/katex.min.css";
import "../styles/site.css";
import Nav from "../components/Nav.astro";
import { site } from "../lib/site";

interface Props {
  page: "home" | "article" | "index";
  title?: string;
  description?: string;
  section?: "writing" | "til";
}
const { page, title, description, section } = Astro.props;
const fullTitle = title ? `${title} · ${site.name}` : site.name;
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    {description && <meta name="description" content={description} />}
    <link rel="alternate" type="application/rss+xml" title={site.name} href="/rss.xml" />
    <script is:inline>
      (function () {
        try {
          var t = localStorage.getItem("bjc-theme");
          if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
        } catch (e) {}
      })();
    </script>
  </head>
  <body class={page}>
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
        </filter>
      </defs>
    </svg>
    <header class="site"><Nav section={section} /></header>
    <main><slot /></main>
  </body>
</html>
```

- [ ] **Step 5: Write the stylesheet foundation**

`src/styles/site.css` (this task writes tokens, base, nav; later tasks append sections):

```css
/* ---- Tokens (Flexoki) ---- */
:root {
  --paper: #FFFCF0;
  --bg2: #F2F0E5;
  --line2: #E6E4D9;
  --line: #DAD8CE;
  --ui: #B7B5AC;
  --muted: #6F6E69;
  --tx3: #403E3B;
  --tx2: #282726;
  --ink: #100F0F;
  --accent: #BC5215;
  --hl: #FED3AF;
  --squig1: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 6' preserveAspectRatio='none'%3E%3Cpath d='M1 4 C 20 1.5, 40 6, 60 3.2 S 100 1.6, 119 4' fill='none' stroke='%23BC5215' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  --squig2: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 6' preserveAspectRatio='none'%3E%3Cpath d='M1 3 C 15 5.5, 30 1, 48 3.8 S 80 5.2, 96 2.4 S 112 4.6, 119 3' fill='none' stroke='%23BC5215' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  --squig3: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 6' preserveAspectRatio='none'%3E%3Cpath d='M1 4.6 C 25 3.8, 45 1.2, 70 3.4 S 105 4.8, 119 2' fill='none' stroke='%23BC5215' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  --serif: "Lora", Georgia, serif;
  --mono: "IBM Plex Mono", ui-monospace, Menlo, monospace;
  color-scheme: light;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper: #100F0F;
    --bg2: #1C1B1A;
    --line2: #282726;
    --line: #343331;
    --ui: #575653;
    --muted: #878580;
    --tx3: #B7B5AC;
    --tx2: #CECDC3;
    --ink: #CECDC3;
    --accent: #DA702C;
    --hl: #4A2B17;
    --squig1: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 6' preserveAspectRatio='none'%3E%3Cpath d='M1 4 C 20 1.5, 40 6, 60 3.2 S 100 1.6, 119 4' fill='none' stroke='%23DA702C' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
    --squig2: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 6' preserveAspectRatio='none'%3E%3Cpath d='M1 3 C 15 5.5, 30 1, 48 3.8 S 80 5.2, 96 2.4 S 112 4.6, 119 3' fill='none' stroke='%23DA702C' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
    --squig3: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 6' preserveAspectRatio='none'%3E%3Cpath d='M1 4.6 C 25 3.8, 45 1.2, 70 3.4 S 105 4.8, 119 2' fill='none' stroke='%23DA702C' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
    color-scheme: dark;
  }
  :root:not([data-theme="light"]) .astro-code span { color: var(--shiki-dark); }
}

:root[data-theme="dark"] {
  --paper: #100F0F;
  --bg2: #1C1B1A;
  --line2: #282726;
  --line: #343331;
  --ui: #575653;
  --muted: #878580;
  --tx3: #B7B5AC;
  --tx2: #CECDC3;
  --ink: #CECDC3;
  --accent: #DA702C;
  --hl: #4A2B17;
  --squig1: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 6' preserveAspectRatio='none'%3E%3Cpath d='M1 4 C 20 1.5, 40 6, 60 3.2 S 100 1.6, 119 4' fill='none' stroke='%23DA702C' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  --squig2: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 6' preserveAspectRatio='none'%3E%3Cpath d='M1 3 C 15 5.5, 30 1, 48 3.8 S 80 5.2, 96 2.4 S 112 4.6, 119 3' fill='none' stroke='%23DA702C' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  --squig3: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 6' preserveAspectRatio='none'%3E%3Cpath d='M1 4.6 C 25 3.8, 45 1.2, 70 3.4 S 105 4.8, 119 2' fill='none' stroke='%23DA702C' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  color-scheme: dark;
}
:root[data-theme="dark"] .astro-code span { color: var(--shiki-dark); }

/* ---- Base ---- */
html { background: var(--paper); }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--serif);
  font-size: 19px;
  line-height: 1.6;
}
header.site { max-width: 760px; margin: 0 auto; padding: 36px 40px 0; box-sizing: border-box; }
main { max-width: 760px; margin: 0 auto; padding: 0 40px 72px; box-sizing: border-box; }
a { color: inherit; text-decoration: none; }
a:hover { color: var(--accent); }
h1, h2, h3 { font-weight: 500; text-wrap: pretty; }
img { max-width: 100%; height: auto; }
code, pre, kbd, time { font-family: var(--mono); }
:not(pre) > code { font-size: 16px; background: var(--bg2); padding: 1px 5px; border-radius: 3px; }

/* ---- Squiggle underline ---- */
.squig {
  text-decoration: none;
  padding-bottom: 2px;
  background-image: var(--squig1);
  background-size: 120px 6px;
  background-repeat: repeat-x;
  background-position: 0 100%;
}
.squig[data-squig="2"] { background-image: var(--squig2); }
.squig[data-squig="3"] { background-image: var(--squig3); }
.squig code { padding: 1px 5px 0; border-radius: 3px 3px 0 0; position: relative; top: -1px; }

/* ---- Nav ---- */
nav[aria-label="Site"] {
  display: flex;
  align-items: baseline;
  gap: 26px;
  margin-bottom: 96px;
}
body.article nav[aria-label="Site"] { margin-bottom: 88px; }
nav[aria-label="Site"] .name { font-weight: 600; font-size: 20px; margin-right: auto; }
nav[aria-label="Site"] ul {
  display: flex;
  gap: 26px;
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 16px;
  color: var(--tx3);
  order: 1;
}
nav[aria-label="Site"] a[aria-current] { color: var(--ink); }
nav[aria-label="Site"] .controls { display: flex; align-items: center; gap: 18px; order: 2; }
nav[aria-label="Site"] button {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  line-height: 0;
  color: var(--tx3);
}
nav[aria-label="Site"] button:hover { color: var(--accent); }
nav[aria-label="Site"] button[hidden] { display: none; }
@media (min-width: 641px) {
  nav[aria-label="Site"] button.menu { display: none; }
}

/* ---- Mobile ---- */
@media (max-width: 640px) {
  body { font-size: 18px; }
  header.site { padding: 20px 22px 0; }
  main { padding: 0 22px 48px; }
  nav[aria-label="Site"] { flex-wrap: wrap; align-items: center; margin-bottom: 44px; }
  body.article nav[aria-label="Site"] { margin-bottom: 44px; }
  nav[aria-label="Site"] .name { font-size: 18px; }
  nav[aria-label="Site"] ul {
    display: none;
    order: 3;
    flex-basis: 100%;
    flex-direction: column;
    gap: 14px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--line);
  }
  nav[aria-label="Site"].menu-open ul,
  nav[aria-label="Site"]:has(button.menu[hidden]) ul { display: flex; }
}
```

Later tasks append their sections before the `/* ---- Mobile ---- */` block and add their mobile rules inside it. Keep that order so the mobile block always comes last.

- [ ] **Step 6: Use the layout from a temporary home page**

`src/pages/index.astro`:
```astro
---
import Base from "../layouts/Base.astro";
---
<Base page="home">
  <p>Layout smoke test. <a class="squig" data-squig="2" href="/writing/">A squiggle link</a>.</p>
</Base>
```

- [ ] **Step 7: Verify**

Run: `npm run build && grep -c 'id="pencil"' dist/index.html && grep -o '<nav aria-label="Site">' dist/index.html && grep -o 'bjc-theme' dist/index.html | head -1 && npm run check`
Expected: one pencil filter, a nav element, the theme key present, `astro check` 0 errors. Then `npx astro dev --background`, open `http://localhost:4321/` in a browser: Lora renders, the nav shows name left and Writing · TIL · ◐ right, the toggle flips the palette and persists across reload, narrowing the window under 640px collapses the list behind the ☰ button. Stop with `npx astro dev stop`.

- [ ] **Step 8: Commit**

```bash
git add src/layouts src/components src/styles src/pages/index.astro
git commit -m "feat: base layout, nav, theme toggle, stylesheet foundation"
```

---

### Task 8: Home page

**Files:**
- Create: `src/components/Link.astro`, `src/components/Highlight.astro`, `src/components/PhotoFrame.astro`, `src/components/PostList.astro`, `src/components/TilList.astro`, `src/components/CvList.astro`
- Modify: `src/pages/index.astro`, `src/styles/site.css`

**Interfaces:**
- Consumes: `site`, `getWriting`, `getTils`, `getCv`, `renderInline`, `variant`, `chevronSvg`, date formatters.
- Produces:
  - `Link.astro` props `{ href: string; class?: string }` + slot → `<a class="squig …" data-squig="v">`.
  - `Highlight.astro` props `{ text: string; highlight?: string }` → text with `<span class="highlight"><svg…/><span>phrase</span></span>`.
  - `PhotoFrame.astro` props `{ file: string; alt?: string }` → `<div class="photo"><img…><svg…></div>`; `file` is relative to `content/`.
  - `PostList.astro` props `{ posts: Post[]; dateStyle?: "month-year" | "day-month"; showKind?: boolean }` → `<ol class="posts">`.
  - `TilList.astro` props `{ tils: Til[] }` → `<ol class="tils">` with `li[id=slug]`.
  - `CvList.astro` props `{ entries: CvEntry[] }` → `<dl class="cv">`.

- [ ] **Step 1: Write the components**

`src/components/Link.astro`:
```astro
---
import { variant } from "../lib/hash";

interface Props { href: string; class?: string }
const { href, class: cls } = Astro.props;
const html = await Astro.slots.render("default");
const v = variant(html.replace(/<[^>]+>/g, ""));
---
<a href={href} class:list={["squig", cls]} data-squig={v}><Fragment set:html={html} /></a>
```

`src/components/Highlight.astro`:
```astro
---
interface Props { text: string; highlight?: string }
const { text, highlight } = Astro.props;
const i = highlight ? text.indexOf(highlight) : -1;
const before = i >= 0 ? text.slice(0, i) : text;
const after = i >= 0 && highlight ? text.slice(i + highlight.length) : "";
---
{before}{i >= 0 && (
  <span class="highlight">
    <svg viewBox="0 0 300 48" preserveAspectRatio="none" aria-hidden="true">
      <path d="M4 30 C 70 22, 150 34, 296 26" fill="none" stroke="currentColor" stroke-width="22" stroke-linecap="round"/>
      <path d="M8 20 C 90 26, 200 14, 292 22" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round"/>
    </svg>
    <span>{highlight}</span>
  </span>
)}{after}
```

`src/components/PhotoFrame.astro`:
```astro
---
import { Image } from "astro:assets";
import type { ImageMetadata } from "astro";

interface Props { file: string; alt?: string }
const { file, alt = "" } = Astro.props;
const photos = import.meta.glob<ImageMetadata>("/content/*.{jpg,jpeg,png,webp}", { eager: true, import: "default" });
const src = photos[`/content/${file}`];
if (!src) throw new Error(`site.yaml photo "${file}" was not found in content/`);
---
<div class="photo">
  <Image src={src} alt={alt} width={400} height={480} />
  <svg viewBox="0 0 200 240" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <clipPath id="photo-clip" clipPathUnits="objectBoundingBox">
        <path d="M.05 .0333 L.96 .0292 L.95 .9708 L.04 .9625 Z"/>
      </clipPath>
    </defs>
    <path d="M10 8 L 192 7 L 190 233 L 8 231 Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
    <path d="M16 237 C 70 240, 140 235, 196 239" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
  </svg>
</div>
```

`src/components/PostList.astro`:
```astro
---
import type { Post } from "../lib/collections";
import { isoDate, fmtMonthYear, fmtDayMonth } from "../lib/dates";

interface Props { posts: Post[]; dateStyle?: "month-year" | "day-month"; showKind?: boolean }
const { posts, dateStyle = "month-year", showKind = false } = Astro.props;
const fmt = dateStyle === "day-month" ? fmtDayMonth : fmtMonthYear;
---
<ol class="posts">
  {posts.map((p) => (
    <li>
      <time datetime={isoDate(p.date)}>{fmt(p.date)}</time>
      <div>
        <a href={p.url}>{p.data.title}</a>
        {p.data.dek && <p>{p.data.dek}</p>}
        {showKind && <span class="kind">{p.data.kind}</span>}
      </div>
    </li>
  ))}
</ol>
```

`src/components/TilList.astro`:
```astro
---
import type { Til } from "../lib/collections";
import { renderInline } from "../lib/markdown/inline";
import { chevronSvg } from "../lib/markdown/svg";
import { variant } from "../lib/hash";
import { isoDate, fmtFull } from "../lib/dates";

interface Props { tils: Til[] }
const { tils } = Astro.props;
---
<ol class="tils">
  {tils.map((t) => {
    const date = fmtFull(t.date);
    return (
      <li id={t.data.slug}>
        <Fragment set:html={chevronSvg(variant(t.line))} />
        <p>
          <Fragment set:html={renderInline(t.line)} />
          {" "}
          <a class="permalink squig" data-squig={variant(date)} href={t.url}><time datetime={isoDate(t.date)}>{date}</time></a>
        </p>
      </li>
    );
  })}
</ol>
```

`src/components/CvList.astro`:
```astro
---
import type { CvEntry } from "../lib/collections";
import { renderInline } from "../lib/markdown/inline";

interface Props { entries: CvEntry[] }
const { entries } = Astro.props;
const range = (e: CvEntry) => (e.data.to ? `${e.data.from}–${e.data.to}` : `${e.data.from}–`);
---
<dl class="cv">
  {entries.map((e) => (
    <>
      <dt>{range(e)}</dt>
      <dd set:html={renderInline(e.body ?? "")} />
    </>
  ))}
</dl>
```

- [ ] **Step 2: Write the home page**

`src/pages/index.astro`:
```astro
---
import Base from "../layouts/Base.astro";
import Highlight from "../components/Highlight.astro";
import PhotoFrame from "../components/PhotoFrame.astro";
import Link from "../components/Link.astro";
import PostList from "../components/PostList.astro";
import TilList from "../components/TilList.astro";
import CvList from "../components/CvList.astro";
import { site } from "../lib/site";
import { getWriting, getTils, getCv } from "../lib/collections";
import { renderInline } from "../lib/markdown/inline";

const posts = (await getWriting()).slice(0, 3);
const tils = (await getTils()).slice(0, 3);
const cv = (await getCv()).slice(0, 3);
---
<Base page="home" description={site.kicker}>
  <header class="intro">
    <p class="kicker">{site.kicker}</p>
    <h1><Highlight text={site.headline} highlight={site.highlight} /></h1>
    {site.photo && <PhotoFrame file={site.photo} alt={site.name} />}
    <p class="bio" set:html={renderInline(site.bio)} />
    <ul class="presence">
      {site.presence.map((l) => <li><Link href={l.href}>{l.label}</Link></li>)}
    </ul>
  </header>

  <section>
    <header><h2>Writing</h2><a href="/writing/">All →</a></header>
    <PostList posts={posts} />
  </section>

  <section>
    <header><h2>Today I learned</h2><a href="/til/">All →</a></header>
    <TilList tils={tils} />
  </section>

  <section>
    <header><h2>Briefly</h2></header>
    <CvList entries={cv} />
  </section>
</Base>
```

- [ ] **Step 3: Append home styles to `site.css`** (insert before the `/* ---- Mobile ---- */` block)

```css
/* ---- Home intro ---- */
header.intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: "kicker" "h1" "bio" "presence";
  column-gap: 44px;
  align-items: start;
  margin-bottom: 80px;
}
header.intro:has(.photo) {
  grid-template-columns: minmax(0, 1fr) 200px;
  grid-template-areas: "kicker photo" "h1 photo" "bio photo" "presence photo";
}
header.intro .kicker { grid-area: kicker; }
header.intro h1 { grid-area: h1; }
header.intro .bio { grid-area: bio; }
header.intro .presence { grid-area: presence; }
header.intro .photo { grid-area: photo; align-self: start; }
.kicker {
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--muted);
  margin: 0 0 18px;
}
header.intro h1 { font-size: 40px; line-height: 1.2; margin: 0 0 20px; }
.bio { font-size: 18px; line-height: 1.6; color: var(--tx3); margin: 0 0 24px; text-wrap: pretty; }
.presence {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--tx3);
}

.highlight { position: relative; display: inline-block; white-space: nowrap; isolation: isolate; }
.highlight svg {
  position: absolute;
  left: -2%;
  top: 2px;
  width: 104%;
  height: 100%;
  z-index: -1;
  color: var(--hl);
  filter: url(#pencil);
}
.highlight span { position: relative; }

.photo { position: relative; width: 200px; height: 240px; }
.photo img { display: block; width: 100%; height: 100%; object-fit: cover; clip-path: url(#photo-clip); }
.photo svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  color: var(--ink);
  filter: url(#pencil);
}

/* ---- Sections ---- */
main > section { margin-bottom: 72px; }
main > section > header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--line);
  padding-bottom: 10px;
  margin-bottom: 18px;
}
main > section > header h2 {
  font-family: var(--mono);
  font-size: 16px;
  font-weight: 500;
  letter-spacing: .06em;
  text-transform: uppercase;
  margin: 0;
  color: var(--tx3);
}
main > section > header a { font-size: 15px; color: var(--accent); }

/* ---- Post list ---- */
.posts { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 22px; }
.posts li { display: grid; grid-template-columns: 110px 1fr; column-gap: 20px; }
.posts time { font-size: 14px; color: var(--muted); padding-top: 5px; }
.posts a { font-weight: 500; }
.posts p { margin: 4px 0 0; color: var(--tx3); font-size: 17px; }
.posts .kind { display: block; font-family: var(--mono); font-size: 12px; color: var(--muted); margin-top: 8px; text-transform: capitalize; }

/* ---- TIL list ---- */
.tils { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.tils li { display: flex; gap: 14px; align-items: baseline; }
.tils .chevron { flex: none; width: 14px; height: 14px; color: var(--accent); position: relative; top: 1px; }
.tils p { margin: 0; flex: 1; color: var(--tx2); }
.permalink { font-family: var(--mono); font-size: 13px; color: var(--muted); white-space: nowrap; }

/* ---- CV ---- */
dl.cv { display: grid; grid-template-columns: 110px 1fr; row-gap: 10px; column-gap: 20px; margin: 0; }
dl.cv dt { font-family: var(--mono); font-size: 14px; color: var(--muted); padding-top: 4px; }
dl.cv dd { margin: 0; color: var(--tx2); }
```

And inside the `@media (max-width: 640px)` block add:

```css
  header.intro { margin-bottom: 56px; }
  header.intro:has(.photo) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: "kicker" "h1" "photo" "bio" "presence";
  }
  header.intro h1 { font-size: 30px; }
  .kicker { font-size: 12px; }
  .photo { width: 160px; height: 192px; margin-bottom: 24px; }
  main > section { margin-bottom: 52px; }
  main > section > header h2 { font-size: 15px; }
  .posts li { grid-template-columns: 1fr; row-gap: 4px; }
  .posts time { font-size: 13px; padding-top: 0; }
  .posts a { font-size: 19px; line-height: 1.35; }
  .posts p { font-size: 16px; }
  .tils .chevron { width: 13px; height: 13px; }
  .tils p { font-size: 16px; }
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run check`
Expected: build succeeds; `dist/index.html` contains `class="intro"`, three `<li>` inside `ol.posts`, three inside `ol.tils` with `id="git-range-diff"` etc., and `<dl class="cv">` with three `<dt>`. Then temporarily copy a real photo (`cp source/dibujos/gato-fiaca.jpg content/photo.jpg`), uncomment `photo: photo.jpg` in `site.yaml`, rebuild, confirm the framed photo renders at the right of the header on desktop and under the headline on mobile, then revert both (`git checkout content/site.yaml && rm content/photo.jpg`).

Visual check with `npx astro dev --background` at 1100px and 390px against `2a-home-desktop.png` and `5a-home-mobile.png` from the handoff: kicker, highlighted headline, bio, presence links with squiggles, three sections with rules, chevrons, permalinks, Briefly grid. Stop the server after.

- [ ] **Step 5: Commit**

```bash
git add src/components src/pages/index.astro src/styles/site.css
git commit -m "feat: home page"
```

---

### Task 9: Article layout, writing pages, code and math styling

**Files:**
- Create: `src/layouts/Article.astro`, `src/pages/writing/[slug].astro`, `src/pages/writing/index.astro`
- Modify: `src/styles/site.css`

**Interfaces:**
- Consumes: `Base`, `Link`, `PostList`, `getWriting`, `render` from `astro:content`, `renderInline`, `isoDate`, `fmtLong`.
- Produces: `Article.astro` props `{ title: string; titleHtml?: string; kind: string; date: Date; tags: string[]; dek?: string; section: "writing" | "til"; prev?: { url: string; title: string }; next?: { url: string; title: string }; description?: string }`, slot = body. Includes the copy-button script.

- [ ] **Step 1: Write `Article.astro`**

```astro
---
import Base from "./Base.astro";
import { site } from "../lib/site";
import { renderInline } from "../lib/markdown/inline";
import { isoDate, fmtLong } from "../lib/dates";

interface Adjacent { url: string; title: string }
interface Props {
  title: string;
  titleHtml?: string;
  kind: string;
  date: Date;
  tags: string[];
  dek?: string;
  section: "writing" | "til";
  prev?: Adjacent;
  next?: Adjacent;
  description?: string;
}
const { title, titleHtml, kind, date, tags, dek, section, prev, next, description } = Astro.props;
---
<Base page="article" section={section} title={title} description={description ?? dek}>
  <article>
    <header>
      <div class="meta">
        <span>{kind} · <time datetime={isoDate(date)}>{fmtLong(date)}</time></span>
        {tags.length > 0 && (
          <ul class="tags">{tags.map((t) => <li><a href={`/tags/${t}/`}>#{t}</a></li>)}</ul>
        )}
      </div>
      <h1>{titleHtml ? <Fragment set:html={titleHtml} /> : title}</h1>
      {dek && <p class="dek">{dek}</p>}
    </header>
    <slot />
    <footer>
      <p set:html={renderInline(site.author_line)} />
      {(prev || next) && (
        <nav class="prev-next" aria-label="Adjacent posts">
          {prev && <a class="prev" href={prev.url}><small>← Previous</small><span>{prev.title}</span></a>}
          {next && <a class="next" href={next.url}><small>Next →</small><span>{next.title}</span></a>}
        </nav>
      )}
    </footer>
  </article>
</Base>
<script>
  document.querySelectorAll<HTMLButtonElement>("figure.code button.copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const pre = btn.closest("figure")?.querySelector("pre");
      const label = btn.querySelector("span");
      if (!pre) return;
      try {
        await navigator.clipboard.writeText(pre.textContent ?? "");
        if (label) label.textContent = "Copied";
        btn.dataset.copied = "";
        setTimeout(() => {
          if (label) label.textContent = "Copy";
          delete btn.dataset.copied;
        }, 1200);
      } catch {}
    });
  });
</script>
```

- [ ] **Step 2: Write the post page and the writing index**

`src/pages/writing/[slug].astro`:
```astro
---
import { render } from "astro:content";
import Article from "../../layouts/Article.astro";
import { getWriting, type Post } from "../../lib/collections";

export async function getStaticPaths() {
  const posts = await getWriting();
  return posts.map((post, i) => ({
    params: { slug: post.data.slug },
    props: { post, prev: posts[i + 1], next: posts[i - 1] },
  }));
}

interface Props { post: Post; prev?: Post; next?: Post }
const { post, prev, next } = Astro.props;
const { Content } = await render(post);
const link = (p?: Post) => (p ? { url: p.url, title: p.data.title } : undefined);
---
<Article
  title={post.data.title}
  kind={post.data.kind}
  date={post.date}
  tags={post.data.tags}
  dek={post.data.dek}
  section="writing"
  prev={link(prev)}
  next={link(next)}
>
  <Content />
</Article>
```

Posts are newest-first, so "previous" is the older neighbour (`i + 1`) and "next" the newer one.

`src/pages/writing/index.astro`:
```astro
---
import Base from "../../layouts/Base.astro";
import PostList from "../../components/PostList.astro";
import { getWriting } from "../../lib/collections";

const posts = await getWriting();
const years = [...new Set(posts.map((p) => p.date.getUTCFullYear()))];
---
<Base page="index" section="writing" title="Writing">
  <h1>Writing</h1>
  <p>Essays take a month and argue for something. Blog posts take an afternoon and report something. Both live here.</p>
  {years.map((y) => (
    <section>
      <h2>{y}</h2>
      <PostList posts={posts.filter((p) => p.date.getUTCFullYear() === y)} dateStyle="day-month" showKind />
    </section>
  ))}
</Base>
```

- [ ] **Step 3: Append article, index, code, figure, quote, and math styles** (before the mobile block)

```css
/* ---- Index pages ---- */
body.index main > h1 { font-size: 40px; margin: 0 0 14px; }
body.index main > h1 + p { color: var(--tx3); font-size: 18px; margin: 0 0 44px; }
body.index main > section { margin-bottom: 52px; }
body.index main > section > h2 {
  display: flex;
  align-items: baseline;
  gap: 16px;
  font-family: var(--mono);
  font-size: 16px;
  font-weight: 500;
  color: var(--muted);
  margin: 0 0 20px;
}
body.index main > section > h2::after { content: ""; flex: 1; height: 1px; background: var(--line); }
body.index .posts { gap: 26px; }
body.index .posts li { grid-template-columns: 90px 1fr; }
body.index .posts a { font-size: 21px; }

/* ---- Article ---- */
body.article main { line-height: 1.65; }
article > header { margin-bottom: 56px; }
.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 18px;
  font-family: var(--mono);
  font-size: 13px;
  color: var(--muted);
  margin: 0 0 18px;
}
.meta > span { letter-spacing: .06em; text-transform: uppercase; }
.tags { display: flex; gap: 8px; list-style: none; margin: 0; padding: 0; }
.tags a { color: var(--accent); }
article h1 { font-size: 44px; line-height: 1.15; margin: 0 0 20px; }
.dek { font-size: 21px; line-height: 1.5; color: var(--tx3); font-style: italic; margin: 0; text-wrap: pretty; }
article > p, article > ul, article > ol, article > table { color: var(--tx2); margin: 0 0 26px; }
article > ul, article > ol { padding-left: 28px; }
article > h2 { font-size: 28px; margin: 56px 0 18px; color: var(--ink); }
article > h3 { font-size: 22px; margin: 40px 0 14px; color: var(--ink); }
article > table { border-collapse: collapse; font-size: 17px; width: 100%; }
article > table th, article > table td { text-align: left; padding: 8px 12px 8px 0; border-bottom: 1px solid var(--line); }
article > table th { font-family: var(--mono); font-size: 13px; font-weight: 500; color: var(--muted); }
article > footer { margin-top: 72px; border-top: 1px solid var(--line); padding-top: 28px; font-size: 16px; color: var(--tx3); }
article > footer > p { margin: 0 0 40px; }
article > footer strong { color: var(--ink); font-weight: 500; }
.prev-next { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; font-size: 17px; }
.prev-next a { display: block; }
.prev-next .next { text-align: right; grid-column: 2; }
.prev-next small { display: block; font-family: var(--mono); font-size: 12px; color: var(--muted); margin-bottom: 4px; }
.prev-next span { font-weight: 500; }

/* ---- Figures ---- */
figure { margin: 44px 0; }
figure img { display: block; max-width: 100%; height: auto; border-radius: 4px; }
figcaption { font-family: var(--mono); font-size: 15px; color: var(--muted); margin-top: 12px; }
figure.framed > div {
  position: relative;
  border-radius: 4px;
  background: repeating-linear-gradient(135deg, var(--bg2) 0 6px, var(--paper) 6px 12px);
}
figure.framed > div img { margin: 0 auto; }
figure.framed .frame { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; color: var(--ink); }

/* ---- Pull quote ---- */
blockquote {
  position: relative;
  margin: 44px 0;
  padding: 6px 0 6px 36px;
  font-size: 24px;
  line-height: 1.4;
  color: var(--ink);
  font-style: italic;
  text-wrap: pretty;
}
blockquote .bracket { position: absolute; left: 0; top: 0; width: 20px; height: 100%; color: var(--accent); }
blockquote p { margin: 0; }
blockquote p + p { margin-top: 12px; }

/* ---- Code ---- */
figure.code { position: relative; margin: 0 0 26px; }
figure.code pre {
  margin: 0;
  padding: 20px 24px;
  background: var(--bg2);
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  overflow-x: auto;
}
figure.code pre code { background: none; padding: 0; font-size: inherit; }
.astro-code span { color: var(--shiki-light); }
figure.code .copy {
  position: absolute;
  top: 10px;
  right: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--mono);
  font-size: 12px;
  color: var(--muted);
  background: var(--bg2);
  border: 0;
  padding: 4px 6px;
  cursor: pointer;
  opacity: 0;
}
figure.code:hover .copy, figure.code .copy:focus-visible, figure.code .copy[data-copied] { opacity: 1; }
figure.code .copy:hover, figure.code .copy[data-copied] { color: var(--accent); }
@media (hover: none) { figure.code .copy { opacity: 1; } }

/* ---- Math ---- */
.katex { font-size: 1.05em; }
.katex-display { margin: 26px 0; overflow-x: auto; overflow-y: hidden; }
```

Mobile additions inside the `@media (max-width: 640px)` block:

```css
  body.index main > h1 { font-size: 30px; }
  article h1 { font-size: 32px; line-height: 1.18; }
  article > h2 { font-size: 24px; }
  .dek { font-size: 19px; }
  .meta { font-size: 12px; }
  article > figure { margin: 36px -22px; }
  article > figure img, article > figure.framed > div { border-radius: 0; }
  article > figure figcaption { padding: 0 22px; }
  figure.code { margin: 0 -22px 26px; }
  figure.code pre { border-radius: 0; font-size: 13.5px; padding: 18px 22px; }
  blockquote { font-size: 21px; }
  .prev-next { grid-template-columns: 1fr; }
  .prev-next .next { text-align: left; grid-column: auto; }
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run check && ls dist/writing`
Expected: `dist/writing/index.html` plus `types-as-a-conversation/`, `twelve-years-maintaining-a-compiler/`, `grading-with-a-repl/`. In `dist/writing/types-as-a-conversation/index.html`: `<div class="meta"><span>essay · <time datetime="2026-08-14">August 14, 2026</time></span>`, three `#tag` links, a `<figure class="framed">`, a `<blockquote data-bracket=`, a `<figure class="code" data-lang="haskell">` with `--shiki-light` spans, prev pointing to `/writing/twelve-years-maintaining-a-compiler/` and no next.

Visual check in the dev server at 1100px and 390px against `3a-article-desktop.png` and `5b-article-mobile.png`: meta row, title, italic dek, body, framed figure with hatch and pencil frame, pull quote with orange bracket, highlighted code with a copy button on hover that copies the block and reads "Copied" briefly, footer author line and prev/next. Check `/writing/` shows the year group with `Aug 14`, `Jun 3`, `Mar 19` and kind labels. Toggle the theme: code colours switch to the dark palette.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/Article.astro src/pages/writing src/styles/site.css
git commit -m "feat: article layout, writing pages, code and math styling"
```

---

### Task 10: TIL pages, tag pages, RSS

**Files:**
- Create: `src/pages/til/index.astro`, `src/pages/til/[slug].astro`, `src/pages/tags/[tag].astro`, `src/pages/rss.xml.ts`

**Interfaces:**
- Consumes: `Base`, `Article`, `PostList`, `TilList`, `getWriting`, `getTils`, `renderInline`, `plainText`, `site`.
- Produces: routes `/til/`, `/til/<slug>/` (only TILs with a note), `/tags/<tag>/`, `/rss.xml`.

- [ ] **Step 1: Write the TIL stream and note pages**

`src/pages/til/index.astro`:
```astro
---
import Base from "../../layouts/Base.astro";
import TilList from "../../components/TilList.astro";
import { getTils } from "../../lib/collections";

const tils = await getTils();
---
<Base page="index" section="til" title="Today I learned">
  <h1>Today I learned</h1>
  <p>Short notes on what I learn along the way. Some have a longer note behind the date.</p>
  <TilList tils={tils} />
</Base>
```

`src/pages/til/[slug].astro`:
```astro
---
import { render } from "astro:content";
import Article from "../../layouts/Article.astro";
import { getTils, type Til } from "../../lib/collections";
import { renderInline, plainText } from "../../lib/markdown/inline";

export async function getStaticPaths() {
  const tils = (await getTils()).filter((t) => t.note !== null);
  return tils.map((til) => ({ params: { slug: til.data.slug }, props: { til } }));
}

interface Props { til: Til }
const { til } = Astro.props;
const { Content } = await render(til);
---
<Article
  title={plainText(til.line)}
  titleHtml={renderInline(til.line)}
  kind="TIL"
  date={til.date}
  tags={til.data.tags}
  section="til"
>
  <Content />
</Article>
```

The `til-note` plugin from Task 4 already removed the one-liner paragraph from `Content`, so the page shows the one-liner once, as the title.

- [ ] **Step 2: Write the tag page**

`src/pages/tags/[tag].astro`:
```astro
---
import Base from "../../layouts/Base.astro";
import PostList from "../../components/PostList.astro";
import TilList from "../../components/TilList.astro";
import { getWriting, getTils, type Post, type Til } from "../../lib/collections";

export async function getStaticPaths() {
  const posts = await getWriting();
  const tils = await getTils();
  const tags = new Set([...posts.flatMap((p) => p.data.tags), ...tils.flatMap((t) => t.data.tags)]);
  return [...tags].sort().map((tag) => ({
    params: { tag },
    props: {
      tag,
      posts: posts.filter((p) => p.data.tags.includes(tag)),
      tils: tils.filter((t) => t.data.tags.includes(tag)),
    },
  }));
}

interface Props { tag: string; posts: Post[]; tils: Til[] }
const { tag, posts, tils } = Astro.props;
---
<Base page="index" title={`#${tag}`}>
  <h1>#{tag}</h1>
  <p>Everything tagged <em>{tag}</em>.</p>
  {posts.length > 0 && (
    <section>
      <header><h2>Writing</h2></header>
      <PostList posts={posts} />
    </section>
  )}
  {tils.length > 0 && (
    <section>
      <header><h2>Today I learned</h2></header>
      <TilList tils={tils} />
    </section>
  )}
</Base>
```

Tag sections reuse the home section header styles (`main > section > header`). The year-group `h2` rule from Task 9 targets `body.index main > section > h2`, which does not match an `h2` inside a `header`, so both coexist.

- [ ] **Step 3: Write the feed**

`src/pages/rss.xml.ts`:
```ts
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
```

- [ ] **Step 4: Verify**

Run: `npm run build && npm run check && ls dist/til dist/tags && head -c 600 dist/rss.xml`
Expected: `dist/til/index.html`, `dist/til/git-range-diff/`, `dist/til/debug-todo/` (the two TILs with notes; no folders for the other three); `dist/tags/` has `compilers elm erlang git maintaining math prolog teaching types`; `rss.xml` starts with an `<rss` document whose first `<item>` is the Sep 2, 2026 TIL. In `dist/til/index.html` the `let-it-crash` row's permalink is `/til/#let-it-crash` and the `git-range-diff` row's is `/til/git-range-diff/`. `dist/til/git-range-diff/index.html` has one `<h1>` containing `<code>git range-diff</code>` and the body starts at "Given two ranges" (the one-liner is not repeated).

Dev-only check: `npx astro dev --background`, `curl -s localhost:4321/til/ | grep -c draft-check` → 1; `npx astro dev stop`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/til src/pages/tags src/pages/rss.xml.ts
git commit -m "feat: til stream and notes, tag pages, rss feed"
```

---

### Task 11: Gallery draft, final checks, and docs

**Files:**
- Create: `content/writing/20260907-gallery.md`, `content/writing/gallery-sketch.png`
- Modify: `README.md` (new), spec if anything drifted

- [ ] **Step 1: Write the gallery draft**

```bash
cp source/dibujos/jazz.png content/writing/gallery-sketch.png
```

`content/writing/20260907-gallery.md`:
````markdown
---
slug: gallery
title: Gallery of widgets
kind: blog
status: draft
tags: [meta]
dek: Every widget the markdown pipeline supports, on one page. Draft, so never deployed.
---

This page exists to eyeball the rendering of each construct. It is a draft, so it only appears under `astro dev`.

## Links and underlines

Three links with three squiggle variants: [alpha](https://example.com/a), [beta](https://example.com/b), [gamma](https://example.com/c), and a link wrapping inline code, [`git range-diff`](https://git-scm.com/docs/git-range-diff). If all three underlines look the same, change a word and check the `data-squig` attribute.

## Lists

- An unordered list item with *emphasis* and **strong** text.
- A second item with `inline code`.

1. First ordered item.
2. Second ordered item.

## Figures

A plain figure, caption from the alt text:

![A plain figure with a caption.](gallery-sketch.png)

A framed figure, hatch behind the drawing, pencil frame on top:

![Fig. 2 — A framed figure.](gallery-sketch.png "framed")

## Pull quotes

> A short quote, to see the bracket at one line.

> A longer quote that wraps to a second line so the bracket stretches, and then keeps going for a third line to be sure of it.

> A third quote so that, with luck, all three bracket variants show up on this page.

## Code

```crystal
class Greeter
  def initialize(@name : String)
  end

  # Say hello
  def greet : String
    "Hello, #{@name}!"
  end
end
```

```haskell
fib :: Int -> Integer
fib n = fibs !! n
  where fibs = 0 : 1 : zipWith (+) fibs (tail fibs) -- lazy list
```

```prolog
% ancestor/2
ancestor(X, Y) :- parent(X, Y).
ancestor(X, Y) :- parent(X, Z), ancestor(Z, Y).
```

```shell
# rebuild and serve
npm run build && npm run preview
```

```
A block with no language.
```

## Math

Inline: the golden ratio is $\varphi = \frac{1 + \sqrt{5}}{2}$.

Display:

$$
\sum_{k=1}^{n} (2k - 1) = n^2
$$

## Table

| Language | Paradigm | First taught |
| --- | --- | --- |
| Prolog | Logic | 2014 |
| Haskell | Functional | 2015 |
| Crystal | Object oriented | 2016 |
````

- [ ] **Step 2: Check the gallery in dev and its absence in production**

Run: `npx astro dev --background && sleep 4 && curl -s localhost:4321/writing/gallery/ | grep -c 'figure class="code"'; npx astro dev stop; npm run build; ls dist/writing | grep -c gallery`
Expected: 5 code figures in dev; `0` gallery folders in `dist/`. Open `http://localhost:4321/writing/gallery/` in a browser and confirm every section renders in both themes: three different underline shapes (inspect `data-squig` values 1, 2, 3 across the page's links), three bracket variants (inspect `data-bracket`), highlighted Crystal, Haskell, Prolog, shell with distinct token colours, copy button works on each, KaTeX inline and display, table with rules.

- [ ] **Step 3: Run the full verification suite**

```bash
npm test && npm run check && npm run build && ls dist dist/writing dist/til dist/tags && cat dist/CNAME
```
Expected: all vitest suites pass; 0 errors from `astro check`; `dist/` contains `index.html`, `writing/`, `til/`, `tags/`, `rss.xml`, `CNAME`, `_astro/` (fonts, CSS, optimized images); no `gallery` or `draft-check` anywhere in `dist/` (`grep -r "draft-check\|/gallery/" dist | wc -l` → 0).

- [ ] **Step 4: Screenshot comparison**

With the dev server running, capture the home page and the essay at 1100px and 390px in light and dark (browser dev tools device toolbar, or the `claude-in-chrome` skill) and compare side by side with `2a-home-desktop.png`, `3a-article-desktop.png`, `5a-home-mobile.png`, `5b-article-mobile.png` from the handoff zip. Fix spacing or size deviations in `site.css` before moving on; the values in this plan come straight from the handoff README, so differences are most likely typos.

- [ ] **Step 5: Write a short `README.md`**

```markdown
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
```

- [ ] **Step 6: Commit**

```bash
git add content README.md
git commit -m "feat: gallery draft, readme"
```

---

## Self-review notes

- Spec coverage: content model (T6), routes (T8–T10), markup (T7–T10), styling and tokens (T7–T9), hand-drawn elements (T4 svg, T8 highlight/photo/chevron, T9 bracket/frame), code blocks and copy (T4, T5, T9), math (T4, T5, T9), client JS (T7 theme/menu, T9 copy), placeholder content and gallery (T6, T11), testing (every task; T11 final), repo cleanup (T1).
- Not covered on purpose: deployment (out of scope per spec), CV page, Projects.
- Known simplification: the `Chevron.astro` component named in the spec is replaced by `chevronSvg()` in `svg.ts` used directly from `TilList.astro`; same output, one less file.
