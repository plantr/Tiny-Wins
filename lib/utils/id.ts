/**
 * Generates a unique client-side ID using timestamp + random alphanumeric suffix.
 * IDs are client-only (no server collision concerns). Format: {timestamp}{random9chars}
 */
export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}
