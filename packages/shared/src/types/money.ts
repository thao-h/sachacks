export type Currency = "USD";

export type Money = {
  amountCents: number;
  currency: Currency;
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/** Throws if value is not a safe integer */
function assertInteger(value: number, label: string): void {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer, got ${value}`);
  }
}

/** Throws if cents value is negative */
export function assertNonNegativeCents(cents: number): void {
  assertInteger(cents, "cents");
  if (cents < 0) {
    throw new Error(`cents must be non-negative, got ${cents}`);
  }
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

export function money(amountCents: number, currency: Currency = "USD"): Money {
  assertInteger(amountCents, "amountCents");
  return { amountCents, currency };
}

// ---------------------------------------------------------------------------
// Arithmetic (all cent-based, all integer-safe)
// ---------------------------------------------------------------------------

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add different currencies: ${a.currency} and ${b.currency}`);
  }
  return money(a.amountCents + b.amountCents, a.currency);
}

export function multiplyMoney(m: Money, quantity: number): Money {
  assertInteger(quantity, "quantity");
  return money(m.amountCents * quantity, m.currency);
}

/** Sum an array of cent values (plain integers, not Money objects) */
export function sumCents(values: number[]): number {
  const total = values.reduce((acc, v) => {
    assertInteger(v, "cents value");
    return acc + v;
  }, 0);
  return total;
}

/** Multiply a cent value by an integer quantity */
export function multiplyCents(cents: number, quantity: number): number {
  assertInteger(cents, "cents");
  assertInteger(quantity, "quantity");
  return cents * quantity;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function formatCents(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}
