import type { CommunityGroup } from "./types";

export interface CommunityGroupRepo {
  findById(id: string): Promise<CommunityGroup | null>;
  findAll(): Promise<CommunityGroup[]>;
  findByZipCode(zipCode: string): Promise<CommunityGroup[]>;
}
