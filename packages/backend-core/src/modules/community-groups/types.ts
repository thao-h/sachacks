export type CommunityGroup = {
  id: string;
  name: string;
  description: string;
  zipCodes: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CommunityGroupSummary = Pick<CommunityGroup, "id" | "name" | "isActive">;
