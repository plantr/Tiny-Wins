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
  // Stub implementation - tests should fail
  return '';
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
  // Stub implementation - tests should fail
  return { interval: '1', period: 'weeks', days: [] };
}
