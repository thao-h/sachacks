"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  HandHeart,
  Leaf,
  Percent,
  PieChart,
  Sparkles,
  Store,
  Timer,
} from "lucide-react";
import {
  createDonationBounty,
  createSurplusBundle,
  getImpactStats,
  getSurplusBundles,
  incrementImpactStats,
  markSurplusDonationRequested,
  publishLiveOffer,
  subscribeLiveOfferUpdates,
  type ImpactStats,
  type SurplusBundle,
} from "@/lib/domain/live-offers";

type GrowthTab = "offers" | "impact";

type BatchCard = {
  id: string;
  communityName: string;
  geography: string;
  currentCents: number;
  thresholdCents: number;
};

const INITIAL_BATCH_CARDS: BatchCard[] = [
  {
    id: "batch_tercero",
    communityName: "Tercero Hall",
    geography: "Central Davis",
    currentCents: 8500,
    thresholdCents: 10000,
  },
  {
    id: "batch_miller",
    communityName: "Miller Hall",
    geography: "South Davis",
    currentCents: 6400,
    thresholdCents: 9000,
  },
  {
    id: "batch_west_village",
    communityName: "West Village",
    geography: "West Davis",
    currentCents: 11200,
    thresholdCents: 13000,
  },
];

function formatDollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function minutesLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 60_000);
}

export default function GrowthOpsPanel({
  restaurantName,
}: {
  restaurantName: string;
}) {
  const [activeTab, setActiveTab] = useState<GrowthTab>("offers");
  const [batchCards, setBatchCards] = useState(INITIAL_BATCH_CARDS);
  const [pushingBatchId, setPushingBatchId] = useState<string | null>(null);
  const [ecoOnlyDiscountEnabled, setEcoOnlyDiscountEnabled] = useState(false);
  const [deadZonePickupEnabled, setDeadZonePickupEnabled] = useState(false);

  const [flashIngredient, setFlashIngredient] = useState("");
  const [flashOfferText, setFlashOfferText] = useState("");
  const [creatingFlash, setCreatingFlash] = useState(false);

  const [surplusItemName, setSurplusItemName] = useState("");
  const [surplusQuantity, setSurplusQuantity] = useState(5);
  const [surplusOriginalPrice, setSurplusOriginalPrice] = useState("12.00");

  const [surplusBundles, setSurplusBundles] = useState<SurplusBundle[]>([]);
  const [impact, setImpact] = useState<ImpactStats>(getImpactStats());
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setSurplusBundles(getSurplusBundles());
      setImpact(getImpactStats());
    };
    sync();
    const unsub = subscribeLiveOfferUpdates(sync);
    return () => {
      unsub();
    };
  }, []);

  const totalActiveSurplusValueCents = useMemo(
    () =>
      surplusBundles.reduce(
        (sum, bundle) => sum + bundle.costOnlyPriceCents * bundle.quantity,
        0,
      ),
    [surplusBundles],
  );

  const batchBoost = (batchId: string) => {
    const batch = batchCards.find((card) => card.id === batchId);
    if (!batch) return;

    setPushingBatchId(batchId);
    const gap = Math.max(batch.thresholdCents - batch.currentCents, 0);
    const appliedSavingsCents = Math.max(500, Math.round(gap * 0.15));

    publishLiveOffer({
      restaurantName,
      title: `15% Batch Booster for ${batch.communityName}`,
      details: `${formatDollars(gap)} to free delivery threshold. 10-minute boost now live in ${batch.geography}.`,
      type: "BATCH_BOOST",
      expiresInMinutes: 10,
    });

    incrementImpactStats({ totalSavingsCents: appliedSavingsCents });
    setBatchCards((prev) =>
      prev.map((card) =>
        card.id === batchId
          ? {
              ...card,
              currentCents: Math.min(
                card.thresholdCents,
                card.currentCents + Math.max(700, Math.round(gap * 0.45)),
              ),
            }
          : card,
      ),
    );
    setNotice(`Push boost sent to ${batch.communityName}`);
    setPushingBatchId(null);
  };

  const toggleEcoOnly = () => {
    setEcoOnlyDiscountEnabled((prev) => {
      const next = !prev;
      if (next) {
        publishLiveOffer({
          restaurantName,
          title: "Eco-Only Discount: 10% off",
          details:
            "Applies to orders delivered by bicycle couriers in Davis zones.",
          type: "ECO_ONLY",
          expiresInMinutes: 180,
        });
        incrementImpactStats({ totalSavingsCents: 800 });
        setNotice("Eco-only discount is live");
      } else {
        setNotice("Eco-only discount paused");
      }
      return next;
    });
  };

  const toggleDeadZonePickup = () => {
    setDeadZonePickupEnabled((prev) => {
      const next = !prev;
      if (next) {
        publishLiveOffer({
          restaurantName,
          title: "Dead-Zone Pickup Offer (2 PM - 4 PM)",
          details: "Pickup-only special is active to keep kitchen flow steady.",
          type: "DEAD_ZONE_PICKUP",
          expiresInMinutes: 120,
        });
        incrementImpactStats({ totalSavingsCents: 500 });
        setNotice("Dead-zone pickup offer enabled");
      } else {
        setNotice("Dead-zone pickup offer paused");
      }
      return next;
    });
  };

  const submitFlashSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashIngredient.trim() || !flashOfferText.trim()) return;

    setCreatingFlash(true);
    publishLiveOffer({
      restaurantName,
      title: `Flash Sale: ${flashOfferText.trim()}`,
      details: `Inventory clearing for ${flashIngredient.trim()} (60-minute window).`,
      type: "FLASH_SALE",
      expiresInMinutes: 60,
    });
    incrementImpactStats({ totalSavingsCents: 1200 });
    setNotice("Flash sale launched for 60 minutes");
    setFlashIngredient("");
    setFlashOfferText("");
    setCreatingFlash(false);
  };

  const createNightLoopBundle = (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(surplusOriginalPrice);
    if (!surplusItemName.trim() || !Number.isFinite(price) || price <= 0) return;

    const originalPriceCents = Math.round(price * 100);
    const bundle = createSurplusBundle({
      restaurantName,
      itemName: surplusItemName.trim(),
      quantity: surplusQuantity,
      originalPriceCents,
    });

    publishLiveOffer({
      restaurantName,
      title: `Surplus Bundle: ${bundle.itemName}`,
      details: `${bundle.quantity} left at cost-only pricing (${formatDollars(bundle.costOnlyPriceCents)} each).`,
      type: "SURPLUS_BUNDLE",
      expiresInMinutes: 60,
    });
    incrementImpactStats({
      wasteDivertedCents: bundle.originalPriceCents * bundle.quantity,
    });

    setSurplusItemName("");
    setSurplusQuantity(5);
    setSurplusOriginalPrice("12.00");
    setNotice("Night Loop surplus bundle created");
    setSurplusBundles(getSurplusBundles());
  };

  const notifyPantry = (bundle: SurplusBundle) => {
    if (bundle.donationRequested) return;

    markSurplusDonationRequested(bundle.id);
    createDonationBounty({
      restaurantName,
      bundleId: bundle.id,
      pickupArea: "Downtown Davis",
      dropoffLocation: "ASUCD Pantry",
      rewardKarma: 25,
    });
    publishLiveOffer({
      restaurantName,
      title: "Pantry Ping: Donation Bounty Posted",
      details: `${bundle.itemName} ready for pantry drop-off via nearby courier route.`,
      type: "DONATION_ALERT",
      expiresInMinutes: 90,
    });
    incrementImpactStats({
      donationsNotified: 1,
      wasteDivertedCents: bundle.costOnlyPriceCents * bundle.quantity,
    });
    setSurplusBundles(getSurplusBundles());
    setNotice("ASUCD Pantry notified and driver bounty posted");
  };

  const generateImpactReport = () => {
    const report = [
      "DDBA Impact Report",
      `Generated: ${new Date().toLocaleString()}`,
      `Restaurant: ${restaurantName}`,
      "",
      `Total Savings Provided: ${formatDollars(impact.totalSavingsCents)}`,
      `Waste Diverted: ${formatDollars(impact.wasteDivertedCents)}`,
      `Donations Notified: ${impact.donationsNotified}`,
      `Donations Completed: ${impact.donationsCompleted}`,
      `Active Surplus Inventory: ${formatDollars(totalActiveSurplusValueCents)}`,
    ].join("\n");

    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ddba-impact-report-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mb-8 bg-white rounded-xl border border-stone-200 p-4 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-stone-900">
            Growth + Community Ops
          </h2>
          <p className="text-sm text-stone-600">
            Manage offers, surplus, and social-good logistics.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("offers")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              activeTab === "offers"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-700"
            }`}
          >
            Offers Command Center
          </button>
          <button
            onClick={() => setActiveTab("impact")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              activeTab === "impact"
                ? "bg-stone-900 text-white"
                : "bg-stone-100 text-stone-700"
            }`}
          >
            Community Impact
          </button>
        </div>
      </div>

      {notice && (
        <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">
          {notice}
        </div>
      )}

      {activeTab === "offers" ? (
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-2">
              Batch Activity Feed
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {batchCards.map((batch) => {
                const ratio = Math.min(
                  100,
                  Math.round((batch.currentCents / batch.thresholdCents) * 100),
                );
                return (
                  <article
                    key={batch.id}
                    className="rounded-lg border border-stone-200 p-3 bg-stone-50"
                  >
                    <p className="font-semibold text-stone-900">{batch.communityName}</p>
                    <p className="text-xs text-stone-500">{batch.geography}</p>
                    <p className="text-sm mt-2 text-stone-700">
                      {formatDollars(batch.currentCents)} /{" "}
                      {formatDollars(batch.thresholdCents)} reached
                    </p>
                    <div className="mt-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                    <button
                      onClick={() => batchBoost(batch.id)}
                      disabled={pushingBatchId === batch.id}
                      className="mt-3 w-full text-sm font-medium rounded-lg bg-primary-600 text-white py-2 hover:bg-primary-700 disabled:opacity-60"
                    >
                      {pushingBatchId === batch.id
                        ? "Sending..."
                        : "Push 15% Boost (10 min)"}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-2">
              Quick Action Toggles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={toggleEcoOnly}
                className="rounded-lg border border-stone-200 p-3 bg-white text-left"
              >
                <p className="font-semibold text-stone-900 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  Eco-Only Discount
                </p>
                <p className="text-xs text-stone-600 mt-1">
                  10% off for bicycle-delivered orders.
                </p>
                <p className="text-xs mt-2 font-medium text-stone-700">
                  {ecoOnlyDiscountEnabled ? "Enabled" : "Disabled"}
                </p>
              </button>

              <button
                onClick={toggleDeadZonePickup}
                className="rounded-lg border border-stone-200 p-3 bg-white text-left"
              >
                <p className="font-semibold text-stone-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary-600" />
                  Dead-Zone Pickup
                </p>
                <p className="text-xs text-stone-600 mt-1">
                  Pickup-only special for 2 PM - 4 PM slow hours.
                </p>
                <p className="text-xs mt-2 font-medium text-stone-700">
                  {deadZonePickupEnabled ? "Enabled" : "Disabled"}
                </p>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-2">
              Inventory Clearing Tool (60-min Flash Sale)
            </h3>
            <form onSubmit={submitFlashSale} className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                value={flashIngredient}
                onChange={(e) => setFlashIngredient(e.target.value)}
                placeholder="Ingredient (e.g. Avocados)"
                className="px-3 py-2 rounded-lg border border-stone-200 bg-stone-50"
              />
              <input
                value={flashOfferText}
                onChange={(e) => setFlashOfferText(e.target.value)}
                placeholder="Offer text (e.g. Free Guac)"
                className="px-3 py-2 rounded-lg border border-stone-200 bg-stone-50"
              />
              <button
                type="submit"
                disabled={creatingFlash}
                className="rounded-lg bg-stone-900 text-white text-sm font-medium px-4 py-2 hover:bg-black disabled:opacity-60"
              >
                {creatingFlash ? "Launching..." : "Launch Flash Sale"}
              </button>
            </form>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-2">
              Surplus Sale: Night Loop
            </h3>
            <form
              onSubmit={createNightLoopBundle}
              className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3"
            >
              <input
                value={surplusItemName}
                onChange={(e) => setSurplusItemName(e.target.value)}
                placeholder="Item name"
                className="px-3 py-2 rounded-lg border border-stone-200 bg-stone-50"
              />
              <input
                type="number"
                min={1}
                value={surplusQuantity}
                onChange={(e) => setSurplusQuantity(Math.max(1, Number(e.target.value)))}
                className="px-3 py-2 rounded-lg border border-stone-200 bg-stone-50"
              />
              <input
                value={surplusOriginalPrice}
                onChange={(e) => setSurplusOriginalPrice(e.target.value)}
                placeholder="Original price (USD)"
                className="px-3 py-2 rounded-lg border border-stone-200 bg-stone-50"
              />
              <button
                type="submit"
                className="rounded-lg bg-green-600 text-white text-sm font-medium px-4 py-2 hover:bg-green-700"
              >
                Create Surplus Bundle
              </button>
            </form>

            <div className="space-y-2">
              {surplusBundles.length === 0 ? (
                <p className="text-sm text-stone-500">
                  No surplus bundles yet.
                </p>
              ) : (
                surplusBundles.slice(0, 6).map((bundle) => (
                  <article
                    key={bundle.id}
                    className="rounded-lg border border-stone-200 bg-stone-50 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-stone-900">{bundle.itemName}</p>
                        <p className="text-xs text-stone-600">
                          {bundle.quantity} units • cost-only{" "}
                          {formatDollars(bundle.costOnlyPriceCents)} (orig{" "}
                          {formatDollars(bundle.originalPriceCents)})
                        </p>
                        <p className="text-xs text-amber-700 mt-1 flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {minutesLeft(bundle.expiresAt)} min left
                        </p>
                      </div>
                      <button
                        onClick={() => notifyPantry(bundle)}
                        disabled={bundle.donationRequested}
                        className="text-sm font-medium px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                      >
                        {bundle.donationRequested
                          ? "Pantry Notified"
                          : "Notify ASUCD Pantry / Food Bank"}
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
              <p className="text-xs text-primary-700">Total Savings Provided</p>
              <p className="text-2xl font-bold text-primary-900">
                {formatDollars(impact.totalSavingsCents)}
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-xs text-green-700">Waste Diverted</p>
              <p className="text-2xl font-bold text-green-900">
                {formatDollars(impact.wasteDivertedCents)}
              </p>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
              <p className="text-xs text-purple-700">Donations (Notified / Completed)</p>
              <p className="text-2xl font-bold text-purple-900">
                {impact.donationsNotified} / {impact.donationsCompleted}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <h3 className="font-semibold text-stone-900 mb-2 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-stone-700" />
              Community Impact Summary
            </h3>
            <ul className="text-sm text-stone-700 space-y-1">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-600" />
                Batch boosts + flash sales are tracked as customer savings.
              </li>
              <li className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-green-600" />
                Surplus bundle value contributes to waste diversion.
              </li>
              <li className="flex items-center gap-2">
                <HandHeart className="w-4 h-4 text-purple-600" />
                Pantry pings create courier donation bounties.
              </li>
            </ul>

            <button
              onClick={generateImpactReport}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-stone-900 text-white px-4 py-2 text-sm font-medium hover:bg-black"
            >
              <BellRing className="w-4 h-4" />
              Generate DDBA Impact Report
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
