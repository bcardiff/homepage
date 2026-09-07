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
