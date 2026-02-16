/**
 * Returns today's date as YYYY-MM-DD string in local timezone.
 * Zero-pads month and day to always produce 10-character string.
 */
export function getTodayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
