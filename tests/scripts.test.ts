import { describe, expect, it } from "vitest";
import { resolveScripts } from "../src/lib/scripts";

const md = "content/writing/20151015-intro-prolog.md";

describe("resolveScripts", () => {
  it("keeps absolute URLs as external libraries", () => {
    expect(resolveScripts(md, ["https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"])).toEqual([
      { kind: "external", src: "https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js" },
    ]);
    expect(resolveScripts(md, ["//example.com/x.js"])[0].kind).toBe("external");
  });

  it("resolves relative paths against the Markdown file", () => {
    expect(resolveScripts(md, ["./20151015-intro-prolog/_scripts.js"])).toEqual([
      { kind: "classic", path: "/content/writing/20151015-intro-prolog/_scripts.js" },
    ]);
    expect(resolveScripts(md, ["shared/anim.js"])).toEqual([
      { kind: "classic", path: "/content/writing/shared/anim.js" },
    ]);
    expect(resolveScripts(md, ["../shared/anim.js"])).toEqual([
      { kind: "classic", path: "/content/shared/anim.js" },
    ]);
  });

  it("treats *.module.js and *.module.ts as bundled modules", () => {
    expect(resolveScripts(md, ["./a/sketch.module.js", "./a/sketch.module.ts"]).map((s) => s.kind)).toEqual([
      "module",
      "module",
    ]);
  });

  it("preserves the declared order", () => {
    expect(resolveScripts(md, ["https://x.test/a.js", "./b.js", "./c.module.js"]).map((s) => s.kind)).toEqual([
      "external",
      "classic",
      "module",
    ]);
  });

  it("rejects absolute paths and non-script files", () => {
    expect(() => resolveScripts(md, ["/content/a.js"])).toThrow(/relative/);
    expect(() => resolveScripts(md, ["./a.css"])).toThrow(/\.js or \.ts/);
  });
});
