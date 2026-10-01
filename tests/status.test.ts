import { describe, expect, it } from "vitest";
import { entryStatuses, isListed, isRoutable } from "../src/lib/status";

describe("entry status visibility", () => {
  it.each(entryStatuses)("handles %s in development and production", (status) => {
    expect(isListed(status, true)).toBe(true);
    expect(isRoutable(status, true)).toBe(true);
    expect(isListed(status, false)).toBe(status === "published");
    expect(isRoutable(status, false)).toBe(status !== "draft");
  });
});
