import { getTodayStr } from "./date";

describe("getTodayStr", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns YYYY-MM-DD format", () => {
    jest.setSystemTime(new Date("2026-02-16T10:30:00"));
    const result = getTodayStr();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe("2026-02-16");
  });

  it("zero-pads single-digit month", () => {
    jest.setSystemTime(new Date("2026-01-05T10:00:00"));
    expect(getTodayStr()).toBe("2026-01-05");
  });

  it("zero-pads single-digit day", () => {
    jest.setSystemTime(new Date("2026-12-03T10:00:00"));
    expect(getTodayStr()).toBe("2026-12-03");
  });

  it("handles double-digit month and day", () => {
    jest.setSystemTime(new Date("2026-11-25T10:00:00"));
    expect(getTodayStr()).toBe("2026-11-25");
  });

  it("handles year boundary (last day of year)", () => {
    jest.setSystemTime(new Date("2025-12-31T23:59:00"));
    expect(getTodayStr()).toBe("2025-12-31");
  });

  it("handles new year (first day of year)", () => {
    jest.setSystemTime(new Date("2026-01-01T00:01:00"));
    expect(getTodayStr()).toBe("2026-01-01");
  });
});
