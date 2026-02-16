import { getTodayStr, getWeekStartDate } from "./date";

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

describe("getWeekStartDate", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("default Monday start", () => {
    it("returns Monday for Wednesday 2026-02-18", () => {
      const wed = new Date("2026-02-18T10:00:00");
      expect(getWeekStartDate("Monday", wed)).toBe("2026-02-16");
    });

    it("returns same day when already Monday 2026-02-16", () => {
      const mon = new Date("2026-02-16T10:00:00");
      expect(getWeekStartDate("Monday", mon)).toBe("2026-02-16");
    });

    it("returns previous Monday for Sunday 2026-02-22", () => {
      const sun = new Date("2026-02-22T10:00:00");
      expect(getWeekStartDate("Monday", sun)).toBe("2026-02-16");
    });

    it("returns previous Monday for Saturday 2026-02-21", () => {
      const sat = new Date("2026-02-21T10:00:00");
      expect(getWeekStartDate("Monday", sat)).toBe("2026-02-16");
    });
  });

  describe("Sunday start", () => {
    it("returns Sunday for Wednesday 2026-02-18", () => {
      const wed = new Date("2026-02-18T10:00:00");
      expect(getWeekStartDate("Sunday", wed)).toBe("2026-02-15");
    });

    it("returns same day when already Sunday 2026-02-15", () => {
      const sun = new Date("2026-02-15T10:00:00");
      expect(getWeekStartDate("Sunday", sun)).toBe("2026-02-15");
    });

    it("returns previous Sunday for Saturday 2026-02-21", () => {
      const sat = new Date("2026-02-21T10:00:00");
      expect(getWeekStartDate("Sunday", sat)).toBe("2026-02-15");
    });
  });

  describe("other start days", () => {
    it("returns previous Thursday for Wednesday 2026-02-18 with Thursday start", () => {
      const wed = new Date("2026-02-18T10:00:00");
      expect(getWeekStartDate("Thursday", wed)).toBe("2026-02-12");
    });

    it("returns same day when already Saturday 2026-02-21 with Saturday start", () => {
      const sat = new Date("2026-02-21T10:00:00");
      expect(getWeekStartDate("Saturday", sat)).toBe("2026-02-21");
    });
  });

  describe("cross month boundary", () => {
    it("returns Monday 2026-03-02 for Tuesday 2026-03-03 with Monday start", () => {
      const tue = new Date("2026-03-03T10:00:00");
      expect(getWeekStartDate("Monday", tue)).toBe("2026-03-02");
    });

    it("returns same day when already Monday 2026-03-02 with Monday start", () => {
      const mon = new Date("2026-03-02T10:00:00");
      expect(getWeekStartDate("Monday", mon)).toBe("2026-03-02");
    });

    it("returns Sunday 2026-03-01 for Monday 2026-03-02 with Sunday start", () => {
      const mon = new Date("2026-03-02T10:00:00");
      expect(getWeekStartDate("Sunday", mon)).toBe("2026-03-01");
    });
  });

  describe("negative diff branch coverage", () => {
    it("handles negative diff when current day < week start day (Sunday -> Tuesday start)", () => {
      // Sunday (0) with Tuesday start (2) -> diff = 0 - 2 = -2, should add 7 to get 5
      const sun = new Date("2026-02-22T10:00:00"); // Sunday
      expect(getWeekStartDate("Tuesday", sun)).toBe("2026-02-17"); // Previous Tuesday
    });

    it("handles negative diff when current day < week start day (Monday -> Friday start)", () => {
      // Monday (1) with Friday start (5) -> diff = 1 - 5 = -4, should add 7 to get 3
      const mon = new Date("2026-02-16T10:00:00"); // Monday
      expect(getWeekStartDate("Friday", mon)).toBe("2026-02-13"); // Previous Friday
    });
  });

  describe("default parameters", () => {
    it("uses current date when now parameter is not provided", () => {
      // Set system time to Wednesday 2026-02-18
      jest.setSystemTime(new Date("2026-02-18T10:00:00"));
      // Should return Monday of current week when no date parameter provided
      expect(getWeekStartDate("Monday")).toBe("2026-02-16");
    });

    it("uses Monday as default weekStartDay when not provided", () => {
      // Set system time to Wednesday 2026-02-18
      const wed = new Date("2026-02-18T10:00:00");
      // Should default to Monday start
      expect(getWeekStartDate(undefined, wed)).toBe("2026-02-16");
    });
  });
});
