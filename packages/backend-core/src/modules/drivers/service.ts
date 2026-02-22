import type { DriverRepo } from "./repo";

export function createDriverService(repo: DriverRepo) {
  return {
    async getById(id: string) {
      return repo.findById(id);
    },
    async listActive() {
      return repo.findActive();
    },
    async listAll() {
      return repo.findAll();
    },
  };
}
