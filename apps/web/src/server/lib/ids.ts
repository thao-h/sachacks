import { randomUUID } from "crypto";

/**
 * Generate a prefixed ID: `prefix_<random>`
 * Useful for debugging (you can tell the entity type from the ID).
 */
export function prefixedId(prefix: string): string {
  const segment = randomUUID().replace(/-/g, "").slice(0, 16);
  return `${prefix}_${segment}`;
}

/** Generic random ID (no prefix) */
export function generateId(): string {
  return randomUUID();
}
