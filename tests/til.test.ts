import { describe, expect, it } from "vitest";
import { splitTil, assertOneLiner } from "../src/lib/til";

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
  it("normalises CRLF line endings", () => {
    expect(splitTil("Line.\r\n\r\nNote.")).toEqual({ line: "Line.", note: "Note." });
  });
});

describe("assertOneLiner", () => {
  it("throws naming the file when the line is empty", () => {
    expect(() => assertOneLiner("content/til/20260101-a.md", "")).toThrow(/content\/til\/20260101-a\.md/);
  });
  it("throws when the one-liner is more than a single paragraph", () => {
    expect(() => assertOneLiner("content/til/20260101-a.md", "First.\n\nSecond.")).toThrow(/content\/til\/20260101-a\.md/);
  });
  it("passes for a single paragraph with inline markup", () => {
    expect(() => assertOneLiner("content/til/20260101-a.md", "Just `code` and [a](http://x).")).not.toThrow();
  });
  it("throws when the one-liner renders to a figure, not a paragraph", () => {
    expect(() => assertOneLiner("content/til/20260101-a.md", "![alt](img.png)")).toThrow(/content\/til\/20260101-a\.md/);
  });
  it("throws when the one-liner renders to a heading", () => {
    expect(() => assertOneLiner("content/til/20260101-a.md", "# Title")).toThrow(/content\/til\/20260101-a\.md/);
  });
  it("throws when the one-liner renders to a blockquote", () => {
    expect(() => assertOneLiner("content/til/20260101-a.md", "> quote")).toThrow(/content\/til\/20260101-a\.md/);
  });
});
