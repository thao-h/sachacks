export type RoutePost = {
  id: string;
  driverId: string;
  origin: string;
  destination: string;
  departureTime: Date;
  availableCapacity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type RoutePostSummary = Pick<RoutePost, "id" | "origin" | "destination" | "departureTime" | "isActive">;
