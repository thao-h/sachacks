/** Represents a monetary value in cents (integer) */
export type CentsAmount = number & { readonly __brand: "CentsAmount" };

export function cents(value: number): CentsAmount {
  if (!Number.isInteger(value)) throw new Error(`cents must be integer, got ${value}`);
  return value as CentsAmount;
}
