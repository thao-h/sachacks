import type { MenuItem } from "./types";

export interface MenuRepo {
  findByRestaurant(restaurantId: string): Promise<MenuItem[]>;
  findByIds(ids: string[]): Promise<MenuItem[]>;
  findById(id: string): Promise<MenuItem | null>;
}
