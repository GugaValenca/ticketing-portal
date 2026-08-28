import { describe, expect, it } from "vitest";
import {
  formatUsDateInput,
  isoToUsDate,
  usToIsoDate,
  usDateToBoundary,
} from "./dates";

describe("formatUsDateInput", () => {
  it("inserts slashes as digits are typed", () => {
    expect(formatUsDateInput("1")).toBe("1");
    expect(formatUsDateInput("12")).toBe("12");
    expect(formatUsDateInput("123")).toBe("12/3");
    expect(formatUsDateInput("1225")).toBe("12/25");
    expect(formatUsDateInput("12252026")).toBe("12/25/2026");
  });

  it("strips non-digit characters", () => {
    expect(formatUsDateInput("12/25/2026")).toBe("12/25/2026");
    expect(formatUsDateInput("ab12cd25ef2026")).toBe("12/25/2026");
  });

  it("truncates input beyond 8 digits", () => {
    expect(formatUsDateInput("122520269999")).toBe("12/25/2026");
  });
});

describe("isoToUsDate", () => {
  it("converts a complete ISO date to MM/DD/YYYY", () => {
    expect(isoToUsDate("2026-12-25")).toBe("12/25/2026");
  });

  it("returns an empty string for empty or malformed input", () => {
    expect(isoToUsDate("")).toBe("");
    expect(isoToUsDate("2026-12")).toBe("");
  });
});

describe("usToIsoDate", () => {
  it("converts a complete MM/DD/YYYY date to ISO", () => {
    expect(usToIsoDate("12/25/2026")).toBe("2026-12-25");
  });

  it("returns an empty string for incomplete or malformed input", () => {
    expect(usToIsoDate("")).toBe("");
    expect(usToIsoDate("12/25")).toBe("");
    expect(usToIsoDate("2026-12-25")).toBe("");
  });
});

describe("usDateToBoundary", () => {
  // Boundaries are intentionally in local time (a "day" means the
  // viewer's calendar day), so assert against local getters rather than
  // toISOString(), which would convert to UTC and shift the hour.
  it("returns midnight local time for the 'start' boundary", () => {
    const date = usDateToBoundary("12/25/2026", "start");
    expect(date).not.toBeNull();
    expect([date!.getFullYear(), date!.getMonth(), date!.getDate()]).toEqual([2026, 11, 25]);
    expect([date!.getHours(), date!.getMinutes(), date!.getSeconds(), date!.getMilliseconds()]).toEqual([
      0, 0, 0, 0,
    ]);
  });

  it("returns the last millisecond of the day local time for the 'end' boundary", () => {
    const date = usDateToBoundary("12/25/2026", "end");
    expect(date).not.toBeNull();
    expect([date!.getFullYear(), date!.getMonth(), date!.getDate()]).toEqual([2026, 11, 25]);
    expect([date!.getHours(), date!.getMinutes(), date!.getSeconds(), date!.getMilliseconds()]).toEqual([
      23, 59, 59, 999,
    ]);
  });

  it("the 'end' boundary is later than the 'start' boundary", () => {
    const start = usDateToBoundary("12/25/2026", "start");
    const end = usDateToBoundary("12/25/2026", "end");
    expect(end!.getTime()).toBeGreaterThan(start!.getTime());
  });

  it("returns null for an incomplete or invalid date", () => {
    expect(usDateToBoundary("", "start")).toBeNull();
    expect(usDateToBoundary("13/45/2026", "start")).toBeNull();
  });
});
