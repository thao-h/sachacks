import type { Restaurant } from "./types";

export interface RestaurantRepo {
  findById(id: string): Promise<Restaurant | null>;
  findBySlug(slug: string): Promise<Restaurant | null>;
  findAll(): Promise<Restaurant[]>;
}
