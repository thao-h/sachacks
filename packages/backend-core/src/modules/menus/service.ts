import type { MenuRepo } from "./repo";

export function createMenuService(repo: MenuRepo) {
  return {
    async getByRestaurant(restaurantId: string) {
      // TODO: implement filtering
      return repo.findByRestaurant(restaurantId);
    },
    async getByIds(ids: string[]) {
      return repo.findByIds(ids);
    },
  };
}
