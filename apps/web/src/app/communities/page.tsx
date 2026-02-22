"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, MapPin, ShoppingBag, RefreshCw } from "lucide-react";
import { api } from "@/lib/api-client";
import {
  createBulkOrder,
  createCommunity,
  fetchBulkOrders,
  fetchCommunities,
  issueCommunityInvite,
  joinBulkOrder,
  joinCommunity,
  lockBulkOrder,
  setCommunityAreaPreference,
  type BulkOrder,
  type Community,
} from "@/lib/domain/communities";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { DAVIS_AREAS } from "@/lib/davis-areas";
import OffersSideRail from "@/components/offers/OffersSideRail";

type RestaurantOption = {
  id: string;
  name: string;
};

type BulkOrderFormState = {
  restaurantId: string;
  title: string;
  orderDeadline: string;
  deliveryNotes: string;
};

function defaultDeadlineLocal() {
  return new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16);
}

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function CommunityHubPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [userAreaPreference, setUserAreaPreference] = useState<string | null>(
    null,
  );
  const [communities, setCommunities] = useState<Community[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([
    ...DAVIS_AREAS,
  ]);
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [savingArea, setSavingArea] = useState(false);
  const [creatingCommunity, setCreatingCommunity] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    name: "",
    area: DAVIS_AREAS[0] as (typeof DAVIS_AREAS)[number],
    description: "",
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
  });

  const [inviteInputs, setInviteInputs] = useState<Record<string, string>>({});
  const [generatedInviteCodes, setGeneratedInviteCodes] = useState<
    Record<string, string>
  >({});
  const [bulkOrdersByCommunity, setBulkOrdersByCommunity] = useState<
    Record<string, BulkOrder[]>
  >({});
  const [loadingBulkOrders, setLoadingBulkOrders] = useState<
    Record<string, boolean>
  >({});
  const [bulkOrderForms, setBulkOrderForms] = useState<
    Record<string, BulkOrderFormState>
  >({});

  const loadCommunities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCommunities({
        search: searchTerm || undefined,
        area: selectedArea || undefined,
      });

      setCommunities(data.communities);
      setAvailableAreas(
        data.availableAreas.length > 0 ? data.availableAreas : [...DAVIS_AREAS],
      );
      setUserAreaPreference(data.userAreaPreference);
      if (!selectedArea && data.userAreaPreference) {
        setSelectedArea(data.userAreaPreference);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load communities",
      );
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedArea]);

  const loadRestaurants = useCallback(async () => {
    try {
      const data = (await api.getRestaurants()) as RestaurantOption[];
      setRestaurants(data);
    } catch {
      setRestaurants([]);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  useEffect(() => {
    loadCommunities();
  }, [loadCommunities]);

  const ensureBulkOrderForm = useCallback(
    (communityId: string) => {
      setBulkOrderForms((prev) => {
        if (prev[communityId]) return prev;

        return {
          ...prev,
          [communityId]: {
            restaurantId: restaurants[0]?.id ?? "",
            title: "",
            orderDeadline: defaultDeadlineLocal(),
            deliveryNotes: "",
          },
        };
      });
    },
    [restaurants],
  );

  const loadCommunityBulkOrders = useCallback(
    async (communityId: string) => {
      setLoadingBulkOrders((prev) => ({ ...prev, [communityId]: true }));
      setActionError(null);

      try {
        const data = await fetchBulkOrders({ communityId });
        setBulkOrdersByCommunity((prev) => ({
          ...prev,
          [communityId]: data.bulkOrders,
        }));
        ensureBulkOrderForm(communityId);
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : "Failed to load bulk orders",
        );
      } finally {
        setLoadingBulkOrders((prev) => ({ ...prev, [communityId]: false }));
      }
    },
    [ensureBulkOrderForm],
  );

  const updateCommunity = useCallback((updated: Community) => {
    setCommunities((prev) =>
      prev.map((community) =>
        community.id === updated.id ? updated : community,
      ),
    );
  }, []);

  const areaSelectOptions = useMemo(
    () => (availableAreas.length > 0 ? availableAreas : [...DAVIS_AREAS]),
    [availableAreas],
  );

  const handleSaveAreaPreference = async () => {
    setSavingArea(true);
    setActionError(null);
    setActionNotice(null);
    try {
      const area = selectedArea || null;
      await setCommunityAreaPreference(area);
      setUserAreaPreference(area);
      setActionNotice(
        area
          ? `Area preference set to ${area}`
          : "Area preference cleared",
      );
      await loadCommunities();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update area preference",
      );
    } finally {
      setSavingArea(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionNotice(null);

    if (!createForm.name.trim()) {
      setActionError("Community name is required");
      return;
    }

    setCreatingCommunity(true);
    try {
      const created = await createCommunity({
        name: createForm.name.trim(),
        area: createForm.area,
        description: createForm.description.trim() || undefined,
        visibility: createForm.visibility,
      });

      setCommunities((prev) => [created.community, ...prev]);
      if (created.inviteCode) {
        setGeneratedInviteCodes((prev) => ({
          ...prev,
          [created.community.id]: created.inviteCode!,
        }));
      }

      setCreateForm({
        name: "",
        area: createForm.area,
        description: "",
        visibility: "PUBLIC",
      });

      setActionNotice("Community created successfully");
      await loadCommunities();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to create community",
      );
    } finally {
      setCreatingCommunity(false);
    }
  };

  const handleJoinCommunity = async (community: Community) => {
    setBusyAction(`join-${community.id}`);
    setActionError(null);
    setActionNotice(null);

    try {
      const result = await joinCommunity(
        community.id,
        inviteInputs[community.id]?.trim() || undefined,
      );
      updateCommunity(result.community);
      setActionNotice(`Joined ${community.name}`);
      await loadCommunityBulkOrders(community.id);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to join community",
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleGenerateInviteCode = async (community: Community) => {
    setBusyAction(`invite-${community.id}`);
    setActionError(null);
    setActionNotice(null);

    try {
      const data = await issueCommunityInvite(community.id);
      setGeneratedInviteCodes((prev) => ({
        ...prev,
        [community.id]: data.inviteCode,
      }));
      setActionNotice(`Invite code refreshed for ${community.name}`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to generate invite code",
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleCreateBulkOrder = async (
    e: React.FormEvent,
    community: Community,
  ) => {
    e.preventDefault();
    const form = bulkOrderForms[community.id];
    if (!form) return;

    setBusyAction(`bulk-create-${community.id}`);
    setActionError(null);
    setActionNotice(null);

    try {
      if (!form.restaurantId) {
        throw new Error("Select a restaurant for the bulk order");
      }
      if (!form.title.trim()) {
        throw new Error("Bulk order title is required");
      }
      if (!form.orderDeadline) {
        throw new Error("Order deadline is required");
      }

      await createBulkOrder({
        communityId: community.id,
        restaurantId: form.restaurantId,
        title: form.title.trim(),
        orderDeadline: new Date(form.orderDeadline).toISOString(),
        deliveryNotes: form.deliveryNotes.trim() || undefined,
      });

      setBulkOrderForms((prev) => ({
        ...prev,
        [community.id]: {
          ...form,
          title: "",
          deliveryNotes: "",
          orderDeadline: defaultDeadlineLocal(),
        },
      }));

      setActionNotice(`Bulk order started in ${community.name}`);
      await Promise.all([
        loadCommunityBulkOrders(community.id),
        loadCommunities(),
      ]);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to start bulk order",
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleJoinBulkOrder = async (communityId: string, bulkOrderId: string) => {
    setBusyAction(`bulk-join-${bulkOrderId}`);
    setActionError(null);
    setActionNotice(null);
    try {
      await joinBulkOrder(bulkOrderId);
      setActionNotice("Joined bulk order");
      await loadCommunityBulkOrders(communityId);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to join bulk order",
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleLockBulkOrder = async (communityId: string, bulkOrderId: string) => {
    setBusyAction(`bulk-lock-${bulkOrderId}`);
    setActionError(null);
    setActionNotice(null);
    try {
      await lockBulkOrder(bulkOrderId);
      setActionNotice("Bulk order locked");
      await Promise.all([loadCommunityBulkOrders(communityId), loadCommunities()]);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to lock bulk order",
      );
    } finally {
      setBusyAction(null);
    }
  };

  if (loading) {
    return <LoadingState message="Loading communities..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load communities"
        message={error}
        onRetry={loadCommunities}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="bg-white border-b border-stone-200 sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
          <h1 className="text-2xl font-bold text-stone-900">Community Hub</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="md:col-span-2 px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <select
              value={selectedArea}
              onChange={(event) => setSelectedArea(event.target.value)}
              className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">All areas</option>
              {areaSelectOptions.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveAreaPreference}
              disabled={savingArea}
              className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-60"
            >
              {savingArea ? "Saving..." : "Save Area Preference"}
            </button>
            <button
              onClick={loadCommunities}
              className="bg-white border border-stone-200 hover:bg-stone-100 text-sm font-medium px-3 py-2 rounded-lg"
            >
              Refresh List
            </button>
            {userAreaPreference && (
              <span className="text-sm text-stone-600">
                Preferred area: <span className="font-semibold">{userAreaPreference}</span>
              </span>
            )}
          </div>
          {actionNotice && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              {actionNotice}
            </div>
          )}
          {actionError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {actionError}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-white border border-stone-200 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">
            Start a Community
          </h2>
          <form onSubmit={handleCreateCommunity} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Community name"
                className="px-3 py-2.5 border border-stone-200 rounded-lg bg-stone-50 focus:ring-2 focus:ring-primary-500 outline-none"
              />
              <select
                value={createForm.area}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    area: event.target.value as (typeof DAVIS_AREAS)[number],
                  }))
                }
                className="px-3 py-2.5 border border-stone-200 rounded-lg bg-stone-50 focus:ring-2 focus:ring-primary-500 outline-none"
              >
                {areaSelectOptions.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={createForm.visibility}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    visibility: event.target.value as "PUBLIC" | "PRIVATE",
                  }))
                }
                className="px-3 py-2.5 border border-stone-200 rounded-lg bg-stone-50 focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
              <input
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Description (optional)"
                className="md:col-span-2 px-3 py-2.5 border border-stone-200 rounded-lg bg-stone-50 focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={creatingCommunity}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg disabled:opacity-60"
            >
              {creatingCommunity ? "Creating..." : "Create Community"}
            </button>
          </form>
        </section>

        {communities.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No communities found"
            message="Try changing your search, area filter, or create a new community."
          />
        ) : (
          <section className="space-y-4">
            {communities.map((community) => {
              const bulkOrders = bulkOrdersByCommunity[community.id] ?? [];
              const bulkForm = bulkOrderForms[community.id];
              const canManageInvites =
                community.memberRole === "OWNER" ||
                community.memberRole === "ADMIN";

              return (
                <article
                  key={community.id}
                  className="bg-white border border-stone-200 rounded-xl p-4 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900">
                        {community.name}
                      </h3>
                      <div className="text-sm text-stone-600 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {community.area}
                      </div>
                      {community.description && (
                        <p className="text-sm text-stone-600 mt-2 max-w-2xl">
                          {community.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs font-medium bg-stone-100 text-stone-700 px-2 py-1 rounded-full">
                        {community.visibility}
                      </span>
                      <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                        {community.memberCount} members
                      </span>
                      <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                        {community.openBulkOrderCount} open bulk orders
                      </span>
                      {community.isAreaMatch && (
                        <span className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">
                          Near you
                        </span>
                      )}
                    </div>
                  </div>

                  {!community.joined ? (
                    <div className="flex flex-wrap gap-2 items-center">
                      {community.visibility === "PRIVATE" && (
                        <input
                          value={inviteInputs[community.id] ?? ""}
                          onChange={(event) =>
                            setInviteInputs((prev) => ({
                              ...prev,
                              [community.id]: event.target.value,
                            }))
                          }
                          placeholder="Invite code"
                          className="px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                      )}
                      <button
                        onClick={() => handleJoinCommunity(community)}
                        disabled={busyAction === `join-${community.id}`}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2 rounded-lg disabled:opacity-60"
                      >
                        {busyAction === `join-${community.id}`
                          ? "Joining..."
                          : "Join Community"}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm text-stone-600">
                        Joined as{" "}
                        <span className="font-semibold text-stone-900">
                          {community.memberRole ?? "MEMBER"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => loadCommunityBulkOrders(community.id)}
                          className="inline-flex items-center gap-1.5 bg-white border border-stone-200 hover:bg-stone-100 text-sm font-medium px-3 py-2 rounded-lg"
                        >
                          <RefreshCw className="w-4 h-4" />
                          {loadingBulkOrders[community.id]
                            ? "Loading..."
                            : "Refresh Bulk Orders"}
                        </button>

                        {canManageInvites && (
                          <button
                            onClick={() => handleGenerateInviteCode(community)}
                            disabled={busyAction === `invite-${community.id}`}
                            className="bg-stone-900 hover:bg-black text-white text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-60"
                          >
                            {busyAction === `invite-${community.id}`
                              ? "Generating..."
                              : "Generate Invite Code"}
                          </button>
                        )}

                        {generatedInviteCodes[community.id] && (
                          <span className="text-sm bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg">
                            Invite code:{" "}
                            <span className="font-semibold tracking-wide">
                              {generatedInviteCodes[community.id]}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="border border-stone-200 rounded-lg p-3">
                        <h4 className="font-semibold text-stone-900 mb-2 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4" />
                          Start Bulk Order
                        </h4>
                        <form
                          onSubmit={(event) =>
                            handleCreateBulkOrder(event, community)
                          }
                          className="grid grid-cols-1 md:grid-cols-2 gap-2"
                        >
                          <input
                            value={bulkForm?.title ?? ""}
                            onFocus={() => ensureBulkOrderForm(community.id)}
                            onChange={(event) =>
                              setBulkOrderForms((prev) => ({
                                ...prev,
                                [community.id]: {
                                  ...(prev[community.id] ?? {
                                    restaurantId: restaurants[0]?.id ?? "",
                                    title: "",
                                    orderDeadline: defaultDeadlineLocal(),
                                    deliveryNotes: "",
                                  }),
                                  title: event.target.value,
                                },
                              }))
                            }
                            placeholder="Order title (e.g. Friday sushi run)"
                            className="px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                          <select
                            value={bulkForm?.restaurantId ?? ""}
                            onFocus={() => ensureBulkOrderForm(community.id)}
                            onChange={(event) =>
                              setBulkOrderForms((prev) => ({
                                ...prev,
                                [community.id]: {
                                  ...(prev[community.id] ?? {
                                    restaurantId: "",
                                    title: "",
                                    orderDeadline: defaultDeadlineLocal(),
                                    deliveryNotes: "",
                                  }),
                                  restaurantId: event.target.value,
                                },
                              }))
                            }
                            className="px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 focus:ring-2 focus:ring-primary-500 outline-none"
                          >
                            <option value="">Select restaurant</option>
                            {restaurants.map((restaurant) => (
                              <option key={restaurant.id} value={restaurant.id}>
                                {restaurant.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="datetime-local"
                            value={bulkForm?.orderDeadline ?? defaultDeadlineLocal()}
                            onFocus={() => ensureBulkOrderForm(community.id)}
                            onChange={(event) =>
                              setBulkOrderForms((prev) => ({
                                ...prev,
                                [community.id]: {
                                  ...(prev[community.id] ?? {
                                    restaurantId: restaurants[0]?.id ?? "",
                                    title: "",
                                    orderDeadline: defaultDeadlineLocal(),
                                    deliveryNotes: "",
                                  }),
                                  orderDeadline: event.target.value,
                                },
                              }))
                            }
                            className="px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                          <input
                            value={bulkForm?.deliveryNotes ?? ""}
                            onFocus={() => ensureBulkOrderForm(community.id)}
                            onChange={(event) =>
                              setBulkOrderForms((prev) => ({
                                ...prev,
                                [community.id]: {
                                  ...(prev[community.id] ?? {
                                    restaurantId: restaurants[0]?.id ?? "",
                                    title: "",
                                    orderDeadline: defaultDeadlineLocal(),
                                    deliveryNotes: "",
                                  }),
                                  deliveryNotes: event.target.value,
                                },
                              }))
                            }
                            placeholder="Delivery notes (optional)"
                            className="px-3 py-2 border border-stone-200 rounded-lg bg-stone-50 focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                          <button
                            type="submit"
                            disabled={busyAction === `bulk-create-${community.id}`}
                            className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg disabled:opacity-60"
                          >
                            {busyAction === `bulk-create-${community.id}`
                              ? "Starting..."
                              : "Start Bulk Order"}
                          </button>
                        </form>
                      </div>

                      <div className="space-y-2">
                        {bulkOrders.length === 0 ? (
                          <div className="text-sm text-stone-600 bg-stone-50 border border-stone-200 rounded-lg p-3">
                            No bulk orders loaded yet. Use "Refresh Bulk Orders" to
                            view active orders.
                          </div>
                        ) : (
                          bulkOrders.map((order) => (
                            <div
                              key={order.id}
                              className="border border-stone-200 rounded-lg p-3 flex flex-col gap-2"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <div className="font-semibold text-stone-900">
                                    {order.title}
                                  </div>
                                  <div className="text-sm text-stone-600">
                                    {order.restaurantName} • closes{" "}
                                    {formatDate(order.orderDeadline)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium bg-stone-100 px-2 py-1 rounded-full">
                                    {order.status}
                                  </span>
                                  <span className="text-xs font-medium bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                                    {order.participantsCount} joined
                                  </span>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {!order.joined && order.status === "OPEN" && (
                                  <button
                                    onClick={() =>
                                      handleJoinBulkOrder(community.id, order.id)
                                    }
                                    disabled={busyAction === `bulk-join-${order.id}`}
                                    className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                                  >
                                    {busyAction === `bulk-join-${order.id}`
                                      ? "Joining..."
                                      : "Join"}
                                  </button>
                                )}
                                {order.canLock && order.status === "OPEN" && (
                                  <button
                                    onClick={() =>
                                      handleLockBulkOrder(community.id, order.id)
                                    }
                                    disabled={busyAction === `bulk-lock-${order.id}`}
                                    className="bg-stone-900 hover:bg-black text-white text-sm font-medium px-3 py-1.5 rounded-lg disabled:opacity-60"
                                  >
                                    {busyAction === `bulk-lock-${order.id}`
                                      ? "Locking..."
                                      : "Lock Order"}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>

      <div className="hidden xl:block fixed right-6 top-24 w-80 z-20">
        <OffersSideRail />
      </div>
    </div>
  );
}
