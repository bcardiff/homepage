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
