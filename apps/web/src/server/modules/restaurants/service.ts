import { restaurantRepo } from "./repo";
import { NotFoundError } from "@/server/lib/errors";

export const restaurantService = {
  async getBySlug(slug: string) {
    const restaurant = await restaurantRepo.findBySlug(slug);
    if (!restaurant) throw new NotFoundError("Restaurant", slug);
    return restaurant;
  },

  async listActive() {
    return restaurantRepo.listActive();
  },
};
