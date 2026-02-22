import { api } from "@/lib/api-client";

export type CommunityVisibility = "PUBLIC" | "PRIVATE";
export type CommunityRole = "OWNER" | "ADMIN" | "MEMBER";
export type BulkOrderStatus =
  | "OPEN"
  | "LOCKED"
  | "PLACED"
  | "DELIVERED"
  | "CANCELLED";

export interface Community {
  id: string;
  name: string;
  area: string;
  description?: string | null;
  visibility: CommunityVisibility;
  memberCount: number;
  openBulkOrderCount: number;
  joined: boolean;
  memberRole: CommunityRole | null;
  isAreaMatch: boolean;
  createdAt: string;
}

export interface CommunityListPayload {
  communities: Community[];
  userAreaPreference: string | null;
  availableAreas: string[];
}

export interface BulkOrder {
  id: string;
  communityId: string;
  communityName?: string;
  communityArea?: string;
  restaurantId?: string;
  restaurantName?: string;
  restaurantSlug?: string;
  title?: string;
  orderDeadline?: string;
  deliveryNotes?: string | null;
  status: BulkOrderStatus;
  participantsCount: number;
  joined: boolean;
  isHost: boolean;
  canLock: boolean;
  createdAt?: string;
}

export async function fetchCommunities(query?: {
  search?: string;
  area?: string;
}): Promise<CommunityListPayload> {
  return api.getCommunities(query) as Promise<CommunityListPayload>;
}

export async function createCommunity(input: {
  name: string;
  area: string;
  description?: string;
  visibility: CommunityVisibility;
}): Promise<{ community: Community; inviteCode: string | null }> {
  return api.createCommunity(input) as Promise<{
    community: Community;
    inviteCode: string | null;
  }>;
}

export async function joinCommunity(
  communityId: string,
  inviteCode?: string,
): Promise<{ community: Community }> {
  return api.joinCommunity(communityId, inviteCode) as Promise<{
    community: Community;
  }>;
}

export async function issueCommunityInvite(
  communityId: string,
): Promise<{ inviteCode: string; expiresAt?: string | null; createdAt: string }> {
  return api.issueCommunityInvite(communityId) as Promise<{
    inviteCode: string;
    expiresAt?: string | null;
    createdAt: string;
  }>;
}

export async function setCommunityAreaPreference(
  area: string | null,
): Promise<void> {
  await api.setCommunityAreaPreference(area);
}

export async function fetchBulkOrders(query?: {
  communityId?: string;
  status?: BulkOrderStatus;
}): Promise<{ bulkOrders: BulkOrder[] }> {
  return api.getBulkOrders(query) as Promise<{ bulkOrders: BulkOrder[] }>;
}

export async function createBulkOrder(input: {
  communityId: string;
  restaurantId: string;
  title: string;
  orderDeadline: string;
  deliveryNotes?: string;
}): Promise<{ bulkOrder: BulkOrder }> {
  return api.createBulkOrder(input) as Promise<{ bulkOrder: BulkOrder }>;
}

export async function joinBulkOrder(
  bulkOrderId: string,
): Promise<{ bulkOrder: BulkOrder }> {
  return api.joinBulkOrder(bulkOrderId) as Promise<{ bulkOrder: BulkOrder }>;
}

export async function lockBulkOrder(
  bulkOrderId: string,
): Promise<{ bulkOrder: BulkOrder }> {
  return api.lockBulkOrder(bulkOrderId) as Promise<{ bulkOrder: BulkOrder }>;
}
