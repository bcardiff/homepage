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
