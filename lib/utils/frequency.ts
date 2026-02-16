/**
 * Canonical day ordering for frequency display.
 * Used across guided-builder, edit-habit, and add-habit screens.
 */
export const DAYS_LIST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Builds a human-readable custom frequency string from interval, period, and selected days.
 *
 * @param interval - Numeric interval as string (e.g., "1", "2", "3")
 * @param period - Either "days" or "weeks"
 * @param days - Selected day abbreviations (e.g., ["Mon", "Wed", "Fri"])
 * @returns Formatted frequency string (e.g., "Daily", "Weekly on Mon, Wed", "Every 2 weeks on Tue, Thu")
 */
export function buildCustomFrequency(
  interval: string,
  period: "days" | "weeks",
  days: string[]
): string {
  const n = parseInt(interval) || 1;
  if (period === "weeks" && days.length > 0) {
    const sorted = DAYS_LIST.filter((d) => days.includes(d));
    if (n === 1) return `Weekly on ${sorted.join(", ")}`;
    return `Every ${n} weeks on ${sorted.join(", ")}`;
  }
  if (n === 1) return period === "days" ? "Daily" : "Weekly";
  return `Every ${n} ${period}`;
}

/**
 * Parses a custom frequency string back into its constituent parts.
 * Inverse of buildCustomFrequency for round-trip editing.
 *
 * @param f - Frequency string (e.g., "Weekly on Mon, Wed", "Every 2 days")
 * @returns Object with interval, period, and days array
 */
export function parseCustomFrequency(f: string): {
  interval: string;
  period: "days" | "weeks";
  days: string[];
} {
  let interval = "1";
  let period: "days" | "weeks" = "weeks";
  let days: string[] = [];
  if (f.startsWith("Every ")) {
    const parts = f.replace("Every ", "").split(" ");
    interval = parts[0] || "1";
    if (parts[1]?.startsWith("day")) period = "days";
    else period = "weeks";
    const onIdx = f.indexOf(" on ");
    if (onIdx !== -1) {
      days = f.substring(onIdx + 4).split(", ").map((d) => d.trim()).filter(Boolean);
    }
  } else if (f.startsWith("Weekly on ")) {
    days = f.replace("Weekly on ", "").split(", ").map((d) => d.trim()).filter(Boolean);
  }
  return { interval, period, days };
}
