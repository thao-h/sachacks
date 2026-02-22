export type Driver = {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DriverSummary = Pick<Driver, "id" | "name" | "phone" | "isActive">;
