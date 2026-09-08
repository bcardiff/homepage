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
    const items = [
      { id: "20200101-a", date: new Date(2020, 0, 1) },
      { id: "20210101-b", date: new Date(2021, 0, 1) },
    ];
    expect(items.sort(byDateDesc)[0].date.getFullYear()).toBe(2021);
  });
  it("breaks ties on equal dates by id descending", () => {
    const items = [
      { id: "20260101-a", date: new Date(2026, 0, 1) },
      { id: "20260101-b", date: new Date(2026, 0, 1) },
    ];
    expect(items.sort(byDateDesc).map((i) => i.id)).toEqual(["20260101-b", "20260101-a"]);
  });
});
