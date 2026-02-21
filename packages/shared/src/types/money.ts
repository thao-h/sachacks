export type Currency = "USD";

export type Money = {
  amountCents: number;
  currency: Currency;
};

export function money(amountCents: number, currency: Currency = "USD"): Money {
  return { amountCents: Math.round(amountCents), currency };
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add different currencies: ${a.currency} and ${b.currency}`);
  }
  return money(a.amountCents + b.amountCents, a.currency);
}

export function multiplyMoney(m: Money, quantity: number): Money {
  return money(m.amountCents * quantity, m.currency);
}

export function formatCents(amountCents: number): string {
  return `$${(amountCents / 100).toFixed(2)}`;
}
