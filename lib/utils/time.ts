/**
 * Converts 24-hour time string (HH:MM) to 12-hour format with AM/PM.
 * Handles midnight (00:xx -> 12:xx am) and noon (12:xx -> 12:xx pm).
 */
export function formatTime(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${ampm}`;
}
