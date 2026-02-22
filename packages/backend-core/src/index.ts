// Errors
export * from "./errors/app-error";
export * from "./errors/error-codes";

// Lib
export * from "./lib/money";
export { logger } from "./lib/logger";
export * from "./lib/state-machines";

// Strategy
export * from "./strategy/delivery-strategy";

// Module services (factory functions)
export { createRestaurantService } from "./modules/restaurants/service";
export { createMenuService } from "./modules/menus/service";
export { createOrderService } from "./modules/orders/service";
export { createDeliveryService } from "./modules/deliveries/service";
export { createDriverService } from "./modules/drivers/service";
export { createCommunityGroupService } from "./modules/community-groups/service";
export { createRoutePostService } from "./modules/route-posts/service";

// Module repo interfaces
export type { RestaurantRepo } from "./modules/restaurants/repo";
export type { MenuRepo } from "./modules/menus/repo";
export type { OrderRepo } from "./modules/orders/repo";
export type { DeliveryRepo } from "./modules/deliveries/repo";
export type { DriverRepo } from "./modules/drivers/repo";
export type { CommunityGroupRepo } from "./modules/community-groups/repo";
export type { RoutePostRepo } from "./modules/route-posts/repo";

// Module types
export type * from "./modules/restaurants/types";
export type * from "./modules/menus/types";
export type * from "./modules/orders/types";
export type * from "./modules/deliveries/types";
export type * from "./modules/drivers/types";
export type * from "./modules/community-groups/types";
export type * from "./modules/route-posts/types";
