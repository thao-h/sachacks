import type { RestaurantRepo } from "./repo";

export function createRestaurantService(repo: RestaurantRepo) {
  return {
    async getById(id: string) {
      // TODO: implement
      return repo.findById(id);
    },
    async getBySlug(slug: string) {
      // TODO: implement
      return repo.findBySlug(slug);
    },
    async listAll() {
      // TODO: implement filtering/pagination
      return repo.findAll();
    },
  };
}
