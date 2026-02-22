import { z } from "zod";
import { handleRoute, ok } from "@/server/contracts/api";
import { ValidationError } from "@/server/lib/errors";
import { FIXED_RESTAURANT_LOCATIONS } from "@/lib/routes/fixedRestaurantLocations";

const estimateSchema = z.object({
  restaurantSlug: z.string().min(1),
  deliveryAddress: z.string().optional().default(""),
  deliveryOption: z.enum([
    "route-match",
    "community-batch",
    "direct-courier",
    "pickup",
  ]),
  subtotal: z.number().nonnegative(),
});

type DeliveryOption =
  | "route-match"
  | "community-batch"
  | "direct-courier"
  | "pickup";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeDavisAddress(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return trimmed;

  const lower = trimmed.toLowerCase();
  if (
    lower.includes("davis") ||
    lower.includes("california") ||
    /\bca\b/.test(lower)
  ) {
    return trimmed;
  }

  return `${trimmed}, Davis, CA`;
}

function computeDeliveryFee(option: DeliveryOption, miles: number): number {
  if (option === "pickup") return 0;

  if (option === "route-match") {
    return roundMoney(clamp(Math.max(0.99, 0.75 + 0.45 * miles), 0.99, 4.99));
  }

  if (option === "community-batch") {
    return roundMoney(clamp(Math.max(0.79, 0.60 + 0.35 * miles), 0.79, 3.99));
  }

  return roundMoney(clamp(Math.max(2.49, 1.75 + 0.75 * miles), 2.49, 8.99));
}

async function getDrivingMiles(params: {
  restaurantSlug: string;
  deliveryAddress: string;
}): Promise<{ miles: number; source: "google-directions" | "fallback" }> {
  const coords = FIXED_RESTAURANT_LOCATIONS[params.restaurantSlug];
  if (!coords) {
    throw new ValidationError(`Unknown restaurant slug: ${params.restaurantSlug}`);
  }

  const normalizedAddress = normalizeDavisAddress(params.deliveryAddress);
  if (!normalizedAddress) {
    return { miles: 2.0, source: "fallback" };
  }

  const apiKey =
    process.env.GOOGLE_MAPS_SERVER_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return { miles: 2.0, source: "fallback" };
  }

  const origin = `${coords.lat},${coords.lng}`;
  const url =
    `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}` +
    `&destination=${encodeURIComponent(normalizedAddress)}` +
    `&mode=driving&key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) {
      return { miles: 2.0, source: "fallback" };
    }

    const json = (await response.json()) as {
      status?: string;
      routes?: Array<{
        legs?: Array<{
          distance?: { value?: number };
        }>;
      }>;
    };

    const meters = json.routes?.[0]?.legs?.[0]?.distance?.value;
    if (typeof meters !== "number" || Number.isNaN(meters)) {
      return { miles: 2.0, source: "fallback" };
    }

    return { miles: meters / 1609.34, source: "google-directions" };
  } catch {
    return { miles: 2.0, source: "fallback" };
  }
}

export const POST = handleRoute(async (request) => {
  const body = await request.json();
  const input = estimateSchema.parse(body);

  const taxRateRaw =
    process.env.TAX_RATE ?? process.env.NEXT_PUBLIC_TAX_RATE ?? "0.08";
  const parsedTaxRate = Number(taxRateRaw);
  const taxRate = Number.isFinite(parsedTaxRate) ? parsedTaxRate : 0.08;

  let miles = 0;
  let distanceSource: "google-directions" | "fallback" = "fallback";

  if (input.deliveryOption !== "pickup") {
    const distance = await getDrivingMiles({
      restaurantSlug: input.restaurantSlug,
      deliveryAddress: input.deliveryAddress,
    });
    miles = distance.miles;
    distanceSource = distance.source;
  }

  const distanceMiles = Math.round(miles * 10) / 10;
  const deliveryFee = computeDeliveryFee(input.deliveryOption, miles);
  const tax = roundMoney(input.subtotal * taxRate);
  const grandTotal = roundMoney(input.subtotal + deliveryFee + tax);

  return ok({
    distanceMiles,
    distanceSource,
    deliveryFee,
    tax,
    taxRate,
    grandTotal,
  });
});

