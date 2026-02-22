import { z } from "zod";

export const createMenuItemSchema = z.object({
  restaurantId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).default(""),
  priceCents: z.number().int().nonnegative(),
  category: z.string().min(1).max(100),
  // TODO: add dietary tags, images, modifiers
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
