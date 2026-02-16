/**
 * Returns today's date as YYYY-MM-DD string in local timezone.
 * Zero-pads month and day to always produce 10-character string.
 */
export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Day name type matching the WeekStartDay type from theme-context.
 */
export type DayName = "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

/**
 * Maps day names to JS Date.getDay() indices (0=Sunday, 6=Saturday).
 */
const DAY_INDEX: Record<DayName, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};

/**
 * Returns the start of the current week as a YYYY-MM-DD string,
 * based on the given week start day preference.
 *
 * @param weekStartDay - Which day the week starts on (default: "Monday")
 * @param now - Optional date to calculate from (defaults to new Date(), supports testing)
 * @returns YYYY-MM-DD string for the week's start date
 *
 * @example
 * // On a Wednesday 2026-02-18:
 * getWeekStartDate("Monday") // "2026-02-16"
 * getWeekStartDate("Sunday") // "2026-02-15"
 */
export function getWeekStartDate(weekStartDay: DayName = "Monday", now?: Date): string {
  const d = now ? new Date(now) : new Date();
  const currentDay = d.getDay(); // 0=Sun, 6=Sat
  const startIdx = DAY_INDEX[weekStartDay];
  let diff = currentDay - startIdx;
  if (diff < 0) diff += 7;
  d.setDate(d.getDate() - diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
