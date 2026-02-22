import type { CommunityGroupRepo } from "./repo";

export function createCommunityGroupService(repo: CommunityGroupRepo) {
  return {
    async getById(id: string) {
      return repo.findById(id);
    },
    async listAll() {
      // TODO: implement filtering/pagination
      return repo.findAll();
    },
    async findByZipCode(zipCode: string) {
      return repo.findByZipCode(zipCode);
    },
  };
}
