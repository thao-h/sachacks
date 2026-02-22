function assertInteger(value: number, label: string): void {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer, got ${value}`);
  }
}

export function assertNonNegativeCents(cents: number): void {
  assertInteger(cents, "cents");
  if (cents < 0) throw new Error(`cents must be non-negative, got ${cents}`);
}

export function sumCents(values: number[]): number {
  return values.reduce((acc, v) => {
    assertInteger(v, "cents value");
    return acc + v;
  }, 0);
}

export function multiplyCents(cents: number, quantity: number): number {
  assertInteger(cents, "cents");
  assertInteger(quantity, "quantity");
  return cents * quantity;
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
