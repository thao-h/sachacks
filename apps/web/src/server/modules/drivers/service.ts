import { driverRepo } from "./repo";
import { NotFoundError } from "@/server/lib/errors";

export const driverService = {
  async listActive() {
    return driverRepo.findAll();
  },

  async getById(id: string) {
    const driver = await driverRepo.findById(id);
    if (!driver) throw new NotFoundError("Driver", id);
    return driver;
  },
};
