export type Restaurant = {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type RestaurantSummary = Pick<Restaurant, "id" | "name" | "slug" | "isActive">;
