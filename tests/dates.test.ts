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
