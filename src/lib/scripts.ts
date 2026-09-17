export type PostScript =
  | { kind: "external"; src: string }
  | { kind: "classic"; path: string }
  | { kind: "module"; path: string };

function joinPath(dir: string, rel: string): string {
  const out: string[] = [];
  for (const part of `${dir}/${rel}`.split("/")) {
    if (part === "" || part === ".") continue;
    else if (part === "..") out.pop();
    else out.push(part);
  }
  return `/${out.join("/")}`;
}

/**
 * Resolve the `scripts` frontmatter of an entry into tags the page can render.
 *
 * `https://…` entries are third party libraries loaded as-is. Everything else is a path
 * relative to the Markdown file; `*.module.js` files are bundled by Vite (so they can
 * import packages from `package.json`), any other file is served verbatim as a classic
 * script that runs after the document is parsed.
 */
export function resolveScripts(filePath: string, scripts: readonly string[]): PostScript[] {
  const dir = `/${filePath}`.replace(/\/+/g, "/").replace(/\/[^/]*$/, "");
  return scripts.map((entry) => {
    if (/^(https?:)?\/\//.test(entry)) return { kind: "external", src: entry };
    if (entry.startsWith("/")) throw new Error(`${filePath}: script "${entry}" must be relative to the Markdown file`);
    const path = joinPath(dir, entry);
    if (!/\.(js|ts)$/.test(path)) throw new Error(`${filePath}: script "${entry}" must be a .js or .ts file`);
    return { kind: /\.module\.(js|ts)$/.test(path) ? "module" : "classic", path };
  });
}
