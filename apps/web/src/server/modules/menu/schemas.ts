import { z } from "zod";

// TODO: Add create/update menu item schemas
export const getMenuSchema = z.object({
  restaurantId: z.string().min(1),
});

export type GetMenuInput = z.infer<typeof getMenuSchema>;
