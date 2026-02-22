// ---------------------------------------------------------------------------
// Communities domain – mock data + simulated async operations
// ---------------------------------------------------------------------------

export interface Community {
  id: string;
  name: string;
  memberCount: number;
  activeNow: number;
  area: string;
  joined: boolean;
  imageColor: string;
}

// -- Mock data ---------------------------------------------------------------

const MOCK_COMMUNITIES: Community[] = [
  {
    id: "c1",
    name: "The Colleges Apartments",
    memberCount: 342,
    activeNow: 3,
    area: "95616",
    joined: false,
    imageColor: "bg-blue-100 text-blue-600",
  },
  {
    id: "c2",
    name: "West Davis Neighbors",
    memberCount: 128,
    activeNow: 5,
    area: "95616",
    joined: true,
    imageColor: "bg-green-100 text-green-600",
  },
  {
    id: "c3",
    name: "El Macero Country Club",
    memberCount: 89,
    activeNow: 0,
    area: "95618",
    joined: false,
    imageColor: "bg-orange-100 text-orange-600",
  },
  {
    id: "c4",
    name: "Downtown Davis",
    memberCount: 567,
    activeNow: 12,
    area: "95616",
    joined: false,
    imageColor: "bg-purple-100 text-purple-600",
  },
];

// -- Async fetchers ----------------------------------------------------------

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchCommunities(
  search?: string,
): Promise<Community[]> {
  await delay(400);
  if (!search) return MOCK_COMMUNITIES;
  return MOCK_COMMUNITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.area.includes(search),
  );
}

export async function joinCommunity(
  communityId: string,
): Promise<Community> {
  await delay(300);
  const c = MOCK_COMMUNITIES.find((c) => c.id === communityId);
  if (!c) throw new Error("Community not found");
  return { ...c, joined: true, memberCount: c.memberCount + 1 };
}

export async function leaveCommunity(
  communityId: string,
): Promise<Community> {
  await delay(300);
  const c = MOCK_COMMUNITIES.find((c) => c.id === communityId);
  if (!c) throw new Error("Community not found");
  return { ...c, joined: false, memberCount: c.memberCount - 1 };
}
