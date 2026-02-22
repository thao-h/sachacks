import type { Driver } from "./types";

export interface DriverRepo {
  findById(id: string): Promise<Driver | null>;
  findAll(): Promise<Driver[]>;
  findActive(): Promise<Driver[]>;
}
