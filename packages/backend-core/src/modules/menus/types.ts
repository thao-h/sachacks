export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  priceCents: number;
  category: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type MenuItemSummary = Pick<MenuItem, "id" | "name" | "priceCents" | "isAvailable">;
