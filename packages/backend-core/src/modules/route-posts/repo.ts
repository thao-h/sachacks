import type { RoutePost } from "./types";

export interface RoutePostRepo {
  findById(id: string): Promise<RoutePost | null>;
  findAll(): Promise<RoutePost[]>;
  findByDriver(driverId: string): Promise<RoutePost[]>;
  findActive(): Promise<RoutePost[]>;
}
