"use client";

import { useState } from "react";
import { User, Circle } from "lucide-react";
import { motion } from "motion/react";

const columnColors: Record<string, { border: string; bg: string; badge: string }> = {
  "Ready for Pickup": {
    border: "border-l-amber-400",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
  },
  Assigned: {
    border: "border-l-sky-400",
    bg: "bg-sky-50",
    badge: "bg-sky-100 text-sky-700",
  },
  "Picked Up": {
    border: "border-l-purple-400",
    bg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
  },
  "Dropped Off": {
    border: "border-l-green-400",
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-700",
  },
};

interface DeliveryOrder {
  id: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  restaurant: string;
  items: { name: string; quantity: number }[];
  total: number;
  status: "Ready for Pickup" | "Assigned" | "Picked Up" | "Dropped Off";
  driverId?: string;
  estimatedTime?: string;
}

interface Driver {
  id: string;
  name: string;
  status: "Available" | "On Delivery" | "Offline";
  activeOrders: number;
  completedToday: number;
}

const MOCK_DRIVERS: Driver[] = [
  {
    id: "D1",
    name: "Alex Martinez",
    status: "Available",
    activeOrders: 0,
    completedToday: 12,
  },
  {
    id: "D2",
    name: "Sam Chen",
    status: "On Delivery",
    activeOrders: 2,
    completedToday: 8,
  },
  {
    id: "D3",
    name: "Jordan Lee",
    status: "Available",
    activeOrders: 0,
    completedToday: 15,
  },
  {
    id: "D4",
    name: "Taylor Kim",
    status: "On Delivery",
    activeOrders: 1,
    completedToday: 10,
  },
  {
    id: "D5",
    name: "Morgan Davis",
    status: "Offline",
    activeOrders: 0,
    completedToday: 5,
  },
];

const MOCK_ORDERS: DeliveryOrder[] = [
  {
    id: "ORD001",
    customerName: "John Doe",
    customerAddress: "123 Main St, Apt 4B",
    customerPhone: "(555) 123-4567",
    restaurant: "The Local Kitchen",
    items: [
      { name: "Classic Burger", quantity: 2 },
      { name: "French Fries", quantity: 1 },
    ],
    total: 30.97,
    status: "Ready for Pickup",
    estimatedTime: "10 min",
  },
  {
    id: "ORD003",
    customerName: "Mike Johnson",
    customerAddress: "456 Oak Ave, Suite 12",
    customerPhone: "(555) 345-6789",
    restaurant: "The Local Kitchen",
    items: [
      { name: "Chicken Sandwich", quantity: 3 },
      { name: "Chocolate Shake", quantity: 2 },
    ],
    total: 44.95,
    status: "Ready for Pickup",
    estimatedTime: "5 min",
  },
  {
    id: "ORD005",
    customerName: "Tom Brown",
    customerAddress: "789 Elm St",
    customerPhone: "(555) 567-8901",
    restaurant: "The Local Kitchen",
    items: [
      { name: "Classic Burger", quantity: 1 },
      { name: "French Fries", quantity: 1 },
    ],
    total: 19.98,
    status: "Assigned",
    driverId: "D2",
    estimatedTime: "15 min",
  },
  {
    id: "ORD007",
    customerName: "Lisa Anderson",
    customerAddress: "555 Maple Dr",
    customerPhone: "(555) 789-0123",
    restaurant: "The Local Kitchen",
    items: [{ name: "Margherita Pizza", quantity: 2 }],
    total: 31.98,
    status: "Assigned",
    driverId: "D4",
    estimatedTime: "20 min",
  },
  {
    id: "ORD008",
    customerName: "Chris Wilson",
    customerAddress: "999 Cedar Ln",
    customerPhone: "(555) 890-1234",
    restaurant: "The Local Kitchen",
    items: [{ name: "Caesar Salad", quantity: 1 }],
    total: 10.99,
    status: "Picked Up",
    driverId: "D2",
    estimatedTime: "8 min",
  },
];

export default function DispatchBoardPage() {
  const [orders, setOrders] = useState<DeliveryOrder[]>(MOCK_ORDERS);
  const [drivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [assigningOrder, setAssigningOrder] = useState<DeliveryOrder | null>(null);

  const columns: DeliveryOrder["status"][] = [
    "Ready for Pickup",
    "Assigned",
    "Picked Up",
    "Dropped Off",
  ];

  const getOrdersByStatus = (status: DeliveryOrder["status"]) => {
    return orders.filter((order) => order.status === status);
  };

  const assignDriver = (orderId: string, driverId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "Assigned", driverId } : order,
      ),
    );
    setAssigningOrder(null);
  };

  const moveOrderToStatus = (
    orderId: string,
    newStatus: DeliveryOrder["status"],
  ) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
  };

  const getDriverName = (driverId?: string) => {
    return drivers.find((d) => d.id === driverId)?.name || "Unassigned";
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className="w-80 bg-white border-r border-stone-200 flex flex-col">
        <div className="p-6 border-b border-stone-200">
          <h2 className="font-bold text-stone-900 mb-1">Drivers</h2>
          <p className="text-sm text-stone-600">
            {drivers.filter((d) => d.status === "Available").length} available
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className={`bg-white border-2 rounded-xl p-4 transition-all ${
                assigningOrder
                  ? driver.status === "Available"
                    ? "border-primary-400 cursor-pointer hover:bg-primary-50"
                    : "border-stone-200 opacity-50"
                  : "border-stone-200"
              }`}
              onClick={() => {
                if (assigningOrder && driver.status === "Available") {
                  assignDriver(assigningOrder.id, driver.id);
                }
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-stone-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 truncate">{driver.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <Circle
                      className={`w-2 h-2 ${
                        driver.status === "Available"
                          ? "fill-green-500 text-green-500"
                          : driver.status === "On Delivery"
                            ? "fill-orange-500 text-orange-500"
                            : "fill-stone-400 text-stone-400"
                      }`}
                    />
                    <span className="text-xs text-stone-600">{driver.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 text-sm">
                <div>
                  <p className="text-stone-600">Active</p>
                  <p className="font-semibold text-stone-900">{driver.activeOrders}</p>
                </div>
                <div>
                  <p className="text-stone-600">Today</p>
                  <p className="font-semibold text-stone-900">{driver.completedToday}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-x-auto bg-stone-50">
        <div className="min-w-max h-full p-6 flex gap-4">
          {columns.map((status) => {
            const columnOrders = getOrdersByStatus(status);
            return (
              <div key={status} className="w-80 flex flex-col">
                <div className={`bg-white rounded-t-xl border border-stone-200 border-b-0 p-4 border-l-4 ${columnColors[status]?.border || ""}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-stone-900">{status}</h3>
                    <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${columnColors[status]?.badge || "bg-stone-100 text-stone-700"}`}>
                      {columnOrders.length}
                    </span>
                  </div>
                </div>

                <div className="flex-1 bg-stone-50 border-x border-stone-200 overflow-y-auto p-4 space-y-3">
                  {columnOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      layout
                      layoutId={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className={`bg-white rounded-xl border border-stone-200 border-l-4 ${columnColors[status]?.border || ""} p-4 hover:shadow-lg transition-shadow`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-stone-900">{order.id}</h4>
                          <p className="text-sm text-stone-600">{order.customerName}</p>
                        </div>
                        {order.estimatedTime && (
                          <span className="bg-primary-50 text-primary-700 text-xs font-medium px-2 py-1 rounded-full">
                            {order.estimatedTime}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-3 text-sm">
                        <p className="text-stone-600">{order.customerAddress}</p>
                        <p className="text-stone-500">{order.customerPhone}</p>
                      </div>

                      <div className="space-y-1 mb-3">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-sm text-stone-600">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                        <span className="font-semibold text-stone-900">
                          ${order.total.toFixed(2)}
                        </span>
                        {order.driverId ? (
                          <span className="text-sm text-stone-600">
                            {"\ud83d\ude97"} {getDriverName(order.driverId)}
                          </span>
                        ) : status === "Ready for Pickup" ? (
                          <button
                            onClick={() => setAssigningOrder(order)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Assign Driver
                          </button>
                        ) : null}
                      </div>

                      {status !== "Dropped Off" && (
                        <div className="mt-3 pt-3 border-t border-stone-100">
                          {status === "Ready for Pickup" && order.driverId && (
                            <button
                              onClick={() => moveOrderToStatus(order.id, "Assigned")}
                              className="w-full text-xs bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg transition-colors"
                            >
                              Confirm Assignment
                            </button>
                          )}
                          {status === "Assigned" && (
                            <button
                              onClick={() => moveOrderToStatus(order.id, "Picked Up")}
                              className="w-full text-xs bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                            >
                              Mark Picked Up
                            </button>
                          )}
                          {status === "Picked Up" && (
                            <button
                              onClick={() => moveOrderToStatus(order.id, "Dropped Off")}
                              className="w-full text-xs bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {columnOrders.length === 0 && (
                    <div className="text-center py-8 text-stone-400 text-sm">No orders</div>
                  )}
                </div>

                <div className="bg-white rounded-b-xl border border-stone-200 border-t-0 h-2" />
              </div>
            );
          })}
        </div>
      </div>

      {assigningOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setAssigningOrder(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-bold text-stone-900 mb-4">
              Assign Driver to {assigningOrder.id}
            </h3>
            <p className="text-sm text-stone-600 mb-6">
              Select an available driver from the sidebar
            </p>
            <button
              onClick={() => setAssigningOrder(null)}
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
