import { menuRepo } from "./repo";

export const menuService = {
  async getMenuForRestaurant(restaurantId: string) {
    return menuRepo.findByRestaurant(restaurantId);
  },

  async getItemsByIds(ids: string[]) {
    return menuRepo.findByIds(ids);
  },
};
