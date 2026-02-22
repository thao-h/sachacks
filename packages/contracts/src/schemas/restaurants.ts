import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100),
  address: z.string().min(1).max(500),
  phone: z.string().min(1).max(30),
  // TODO: add operating hours, cuisine type, delivery radius
});

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
