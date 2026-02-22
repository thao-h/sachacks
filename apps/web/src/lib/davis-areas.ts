export const DAVIS_AREAS = [
  "Downtown Davis",
  "Central Davis",
  "North Davis",
  "West Davis",
  "South Davis",
  "East Davis",
  "UC Davis Campus",
] as const;

export type DavisArea = (typeof DAVIS_AREAS)[number];
