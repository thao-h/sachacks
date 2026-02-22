import type { RoutePostRepo } from "./repo";

export function createRoutePostService(repo: RoutePostRepo) {
  return {
    async getById(id: string) {
      return repo.findById(id);
    },
    async listActive() {
      // TODO: implement filtering by area/time
      return repo.findActive();
    },
    async listByDriver(driverId: string) {
      return repo.findByDriver(driverId);
    },
  };
}
