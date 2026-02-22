const LIVE_OFFERS_KEY = "ddba_live_offers_v1";
const SURPLUS_BUNDLES_KEY = "ddba_surplus_bundles_v1";
const DONATION_BOUNTIES_KEY = "ddba_donation_bounties_v1";
const IMPACT_STATS_KEY = "ddba_impact_stats_v1";
const UPDATE_EVENT = "ddba-live-offers-updated";

export type LiveOfferType =
  | "BATCH_BOOST"
  | "ECO_ONLY"
  | "DEAD_ZONE_PICKUP"
  | "CUSTOM_DEAL"
  | "FLASH_SALE"
  | "SURPLUS_BUNDLE"
  | "DONATION_ALERT";

export type CheckoutScope = "all" | "delivery" | "pickup";

export interface LiveOffer {
  id: string;
  restaurantName: string;
  title: string;
  details: string;
  type: LiveOfferType;
  createdAt: string;
  expiresAt: string | null;
  checkoutDiscountPercent?: number | null;
  checkoutScope?: CheckoutScope;
}

export interface SurplusBundle {
  id: string;
  restaurantName: string;
  itemName: string;
  quantity: number;
  originalPriceCents: number;
  costOnlyPriceCents: number;
  expiresAt: string;
  donationRequested: boolean;
  createdAt: string;
}

export type DonationBountyStatus = "OPEN" | "CLAIMED" | "COMPLETED";

export interface DonationBounty {
  id: string;
  restaurantName: string;
  bundleId: string;
  pickupArea: string;
  dropoffLocation: string;
  rewardKarma: number;
  status: DonationBountyStatus;
  createdAt: string;
}

export interface ImpactStats {
  totalSavingsCents: number;
  wasteDivertedCents: number;
  donationsNotified: number;
  donationsCompleted: number;
}

export interface CheckoutOfferDiscount {
  percent: number;
  title: string;
  type: LiveOfferType;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function pruneExpired(offers: LiveOffer[]): LiveOffer[] {
  const now = Date.now();
  return offers.filter((offer) => {
    if (!offer.expiresAt) return true;
    const ts = new Date(offer.expiresAt).getTime();
    return Number.isFinite(ts) && ts > now;
  });
}

export function subscribeLiveOfferUpdates(handler: () => void) {
  if (!canUseStorage()) return () => {};
  const onStorage = (event: StorageEvent) => {
    if (
      event.key === LIVE_OFFERS_KEY ||
      event.key === SURPLUS_BUNDLES_KEY ||
      event.key === DONATION_BOUNTIES_KEY ||
      event.key === IMPACT_STATS_KEY
    ) {
      handler();
    }
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(UPDATE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(UPDATE_EVENT, handler);
  };
}

export function getLiveOffers(): LiveOffer[] {
  const offers = readJson<LiveOffer[]>(LIVE_OFFERS_KEY, []);
  const cleaned = pruneExpired(offers).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (cleaned.length !== offers.length) {
    writeJson(LIVE_OFFERS_KEY, cleaned);
  }
  return cleaned;
}

function normalizeRestaurantName(name: string): string {
  return name.trim().toLowerCase();
}

export function getCheckoutOfferDiscount(input: {
  restaurantName?: string;
  deliveryOption?: string;
}): CheckoutOfferDiscount | null {
  const restaurantName = input.restaurantName?.trim();
  if (!restaurantName) return null;

  const matchingOffers = getLiveOffers().filter(
    (offer) =>
      normalizeRestaurantName(offer.restaurantName) ===
      normalizeRestaurantName(restaurantName),
  );

  if (matchingOffers.length === 0) return null;

  const isPickup = input.deliveryOption === "pickup";
  const customDeal = matchingOffers.find((offer) => {
    if (offer.type !== "CUSTOM_DEAL") return false;
    if (!offer.checkoutDiscountPercent || offer.checkoutDiscountPercent <= 0) {
      return false;
    }
    const scope = offer.checkoutScope ?? "all";
    if (scope === "pickup" && !isPickup) return false;
    if (scope === "delivery" && isPickup) return false;
    return true;
  });

  if (customDeal?.checkoutDiscountPercent) {
    return {
      percent: customDeal.checkoutDiscountPercent,
      title: customDeal.title,
      type: customDeal.type,
    };
  }

  // Priority by strongest checkout impact for MVP.
  const priority: LiveOfferType[] = [
    "BATCH_BOOST",
    "ECO_ONLY",
    "DEAD_ZONE_PICKUP",
    "FLASH_SALE",
    "SURPLUS_BUNDLE",
    "DONATION_ALERT",
  ];

  for (const type of priority) {
    const found = matchingOffers.find((offer) => offer.type === type);
    if (!found) continue;

    if (type === "BATCH_BOOST") {
      return { percent: 15, title: found.title, type };
    }
    if (type === "ECO_ONLY" && input.deliveryOption !== "pickup") {
      return { percent: 10, title: found.title, type };
    }
    if (type === "DEAD_ZONE_PICKUP" && input.deliveryOption === "pickup") {
      return { percent: 10, title: found.title, type };
    }
  }

  return null;
}

export function publishLiveOffer(input: {
  restaurantName: string;
  title: string;
  details: string;
  type: LiveOfferType;
  expiresInMinutes?: number;
  checkoutDiscountPercent?: number;
  checkoutScope?: CheckoutScope;
}) {
  const offers = getLiveOffers();
  const expiresAt =
    input.expiresInMinutes && input.expiresInMinutes > 0
      ? new Date(Date.now() + input.expiresInMinutes * 60_000).toISOString()
      : null;

  const next: LiveOffer = {
    id: makeId("offer"),
    restaurantName: input.restaurantName,
    title: input.title,
    details: input.details,
    type: input.type,
    createdAt: nowIso(),
    expiresAt,
    checkoutDiscountPercent: input.checkoutDiscountPercent ?? null,
    checkoutScope: input.checkoutScope ?? "all",
  };
  writeJson(LIVE_OFFERS_KEY, [next, ...offers].slice(0, 40));
  return next;
}

export function getSurplusBundles(): SurplusBundle[] {
  return readJson<SurplusBundle[]>(SURPLUS_BUNDLES_KEY, []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function createSurplusBundle(input: {
  restaurantName: string;
  itemName: string;
  quantity: number;
  originalPriceCents: number;
}) {
  const bundles = getSurplusBundles();
  const bundle: SurplusBundle = {
    id: makeId("surplus"),
    restaurantName: input.restaurantName,
    itemName: input.itemName,
    quantity: input.quantity,
    originalPriceCents: input.originalPriceCents,
    costOnlyPriceCents: Math.max(50, Math.round(input.originalPriceCents * 0.25)),
    expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
    donationRequested: false,
    createdAt: nowIso(),
  };
  writeJson(SURPLUS_BUNDLES_KEY, [bundle, ...bundles].slice(0, 50));
  return bundle;
}

export function markSurplusDonationRequested(bundleId: string) {
  const bundles = getSurplusBundles();
  const next = bundles.map((bundle) =>
    bundle.id === bundleId ? { ...bundle, donationRequested: true } : bundle,
  );
  writeJson(SURPLUS_BUNDLES_KEY, next);
}

export function getDonationBounties(): DonationBounty[] {
  return readJson<DonationBounty[]>(DONATION_BOUNTIES_KEY, []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function createDonationBounty(input: {
  restaurantName: string;
  bundleId: string;
  pickupArea: string;
  dropoffLocation: string;
  rewardKarma: number;
}) {
  const bounties = getDonationBounties();
  const bounty: DonationBounty = {
    id: makeId("donation"),
    restaurantName: input.restaurantName,
    bundleId: input.bundleId,
    pickupArea: input.pickupArea,
    dropoffLocation: input.dropoffLocation,
    rewardKarma: input.rewardKarma,
    status: "OPEN",
    createdAt: nowIso(),
  };
  writeJson(DONATION_BOUNTIES_KEY, [bounty, ...bounties].slice(0, 50));
  return bounty;
}

export function updateDonationBountyStatus(
  bountyId: string,
  status: DonationBountyStatus,
) {
  const bounties = getDonationBounties();
  const next = bounties.map((bounty) =>
    bounty.id === bountyId ? { ...bounty, status } : bounty,
  );
  writeJson(DONATION_BOUNTIES_KEY, next);
}

export function getImpactStats(): ImpactStats {
  return readJson<ImpactStats>(IMPACT_STATS_KEY, {
    totalSavingsCents: 0,
    wasteDivertedCents: 0,
    donationsNotified: 0,
    donationsCompleted: 0,
  });
}

export function updateImpactStats(patch: Partial<ImpactStats>) {
  const current = getImpactStats();
  const next = {
    ...current,
    ...patch,
  };
  writeJson(IMPACT_STATS_KEY, next);
  return next;
}

export function incrementImpactStats(delta: Partial<ImpactStats>) {
  const current = getImpactStats();
  const next = {
    totalSavingsCents:
      current.totalSavingsCents + (delta.totalSavingsCents ?? 0),
    wasteDivertedCents:
      current.wasteDivertedCents + (delta.wasteDivertedCents ?? 0),
    donationsNotified:
      current.donationsNotified + (delta.donationsNotified ?? 0),
    donationsCompleted:
      current.donationsCompleted + (delta.donationsCompleted ?? 0),
  };
  writeJson(IMPACT_STATS_KEY, next);
  return next;
}
