import { z } from "zod";

export const createRoutePostSchema = z.object({
  driverId: z.string().min(1),
  origin: z.string().min(1).max(500),
  destination: z.string().min(1).max(500),
  departureTime: z.string().datetime(),
  availableCapacity: z.number().int().positive(),
  // TODO: add route waypoints, vehicle type, price per stop
});

export type CreateRoutePostInput = z.infer<typeof createRoutePostSchema>;
