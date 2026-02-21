import { z } from "zod";

// TODO: Add create/update restaurant schemas
export const getRestaurantBySlugSchema = z.object({
  slug: z.string().min(1),
});

export type GetRestaurantBySlugInput = z.infer<typeof getRestaurantBySlugSchema>;
