"use client";

import { useState } from "react";
import {
  X,
  ChevronRight,
  Truck,
  Users,
  Car,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import GrowthOpsPanel from "@/components/restaurant/GrowthOpsPanel";

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Ready"
  | "Out for Delivery"
  | "Delivered"
  | "Canceled";

interface Order {
  id: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  total: number;
  status: OrderStatus;
  fulfillmentMode: "delivery" | "pickup";
  address?: string;
  phone: string;
  createdAt: string;
  isPriority?: boolean;
  deliveryStrategy?: "route-match" | "community-batch" | "direct-courier";
  driverName?: string;
  driverStatus?: "assigned" | "searching";
}

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD001",
    customerName: "John Doe",
    items: [
      { name: "Classic Burger", quantity: 2 },
      { name: "French Fries", quantity: 1 },
    ],
    total: 30.97,
    status: "Pending",
    fulfillmentMode: "delivery",
    deliveryStrategy: "route-match",
    driverStatus: "searching",
    address: "123 Main St, Apt 4B",
    phone: "(555) 123-4567",
    createdAt: "2:45 PM",
    isPriority: true,
  },
  {
    id: "ORD002",
    customerName: "Jane Smith",
    items: [
      { name: "Margherita Pizza", quantity: 1 },
      { name: "Caesar Salad", quantity: 1 },
    ],
    total: 25.98,
    status: "Confirmed",
    fulfillmentMode: "pickup",
    phone: "(555) 234-5678",
    createdAt: "2:30 PM",
  },
  {
    id: "ORD003",
    customerName: "Mike Johnson",
    items: [
      { name: "Chicken Sandwich", quantity: 3 },
      { name: "Chocolate Shake", quantity: 2 },
    ],
    total: 44.95,
    status: "Preparing",
    fulfillmentMode: "delivery",
    deliveryStrategy: "community-batch",
    driverStatus: "assigned",
    driverName: "Alex M.",
    address: "456 Oak Ave, Suite 12",
    phone: "(555) 345-6789",
    createdAt: "2:15 PM",
  },
  {
    id: "ORD004",
    customerName: "Sarah Williams",
    items: [{ name: "Caesar Salad", quantity: 2 }],
    total: 19.98,
    status: "Ready",
    fulfillmentMode: "pickup",
    phone: "(555) 456-7890",
    createdAt: "2:00 PM",
  },
  {
    id: "ORD005",
    customerName: "Tom Brown",
    items: [
      { name: "Classic Burger", quantity: 1 },
      { name: "French Fries", quantity: 1 },
    ],
    total: 19.98,
    status: "Ready",
    fulfillmentMode: "delivery",
    deliveryStrategy: "direct-courier",
    driverStatus: "assigned",
    driverName: "Sarah K.",
    address: "789 Elm St",
    phone: "(555) 567-8901",
    createdAt: "1:45 PM",
  },
  {
    id: "ORD006",
    customerName: "Emily Davis",
    items: [{ name: "Margherita Pizza", quantity: 2 }],
    total: 31.98,
    status: "Delivered",
    fulfillmentMode: "delivery",
    deliveryStrategy: "route-match",
    driverStatus: "assigned",
    driverName: "Mike T.",
    address: "321 Pine Rd",
    phone: "(555) 678-9012",
    createdAt: "1:30 PM",
  },
];

const STATUS_FILTERS: (OrderStatus | "All")[] = [
  "All",
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Canceled",
];

const STATUS_ACTIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Confirmed", "Canceled"],
  Confirmed: ["Preparing", "Canceled"],
  Preparing: ["Ready", "Canceled"],
  Ready: ["Out for Delivery"],
  "Out for Delivery": ["Delivered", "Canceled"],
  Delivered: [],
  Canceled: [],
};

export default function RestaurantDashboardPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders =
    selectedStatus === "All"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }
  };

  const getStatusCount = (status: string) => {
    if (status === "All") return orders.length;
    return orders.filter((order) => order.status === status).length;
  };

  const getStrategyIcon = (strategy?: string) => {
    switch (strategy) {
      case "route-match":
        return <Car className="w-4 h-4 text-primary-600" />;
      case "community-batch":
        return <Users className="w-4 h-4 text-green-600" />;
      case "direct-courier":
        return <Truck className="w-4 h-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getStrategyLabel = (strategy?: string) => {
    switch (strategy) {
      case "route-match":
        return "Route Match";
      case "community-batch":
        return "Community Batch";
      case "direct-courier":
        return "Direct Courier";
      default:
        return "Standard";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Restaurant Dashboard</h1>
        <p className="text-stone-600">Manage incoming orders and update their status</p>
      </div>

      <GrowthOpsPanel restaurantName="The Local Kitchen" />

      <div className="mb-6 overflow-x-auto pb-2">
        <div className="flex gap-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedStatus === status
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
              }`}
            >
              {status}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedStatus === status
                    ? "bg-stone-700 text-white"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {getStatusCount(status)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className={`bg-white rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg relative overflow-hidden ${
              order.isPriority
                ? "border-orange-400 ring-2 ring-orange-100"
                : "border-stone-200 hover:border-primary-300"
            }`}
            onClick={() => setSelectedOrder(order)}
          >
            {order.status === "Ready" && order.fulfillmentMode === "delivery" && (
              <div className="bg-primary-50 border-b border-primary-100 px-4 py-1.5 flex items-center justify-between text-xs font-medium text-primary-700">
                <span className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
                  </span>
                  Auto-dispatch Active
                </span>
                {order.driverStatus === "assigned" ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="w-3 h-3" /> Driver assigned: {order.driverName}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-600">
                    <Loader2 className="w-3 h-3 animate-spin" /> Awaiting driver
                  </span>
                )}
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-stone-900">{order.id}</h3>
                    {order.isPriority && (
                      <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-600">{order.customerName}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="space-y-1 mb-3">
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-sm text-stone-600">
                    {item.quantity}x {item.name}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <span className="text-sm text-stone-500">{order.createdAt}</span>
                <div className="flex items-center gap-2">
                  {order.fulfillmentMode === "delivery" && (
                    <span className="flex items-center gap-1 bg-stone-100 text-stone-600 text-xs px-2 py-1 rounded-md">
                      {getStrategyIcon(order.deliveryStrategy)}
                      {getStrategyLabel(order.deliveryStrategy)}
                    </span>
                  )}
                  <span className="text-sm font-medium text-stone-600 flex items-center gap-1">
                    {order.fulfillmentMode === "delivery" ? "Delivery" : "Pickup"}
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
          <p className="text-stone-500">No orders found for this status</p>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-end">
          <div className="absolute inset-0" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white w-full sm:w-[480px] sm:h-full sm:shadow-2xl overflow-y-auto flex flex-col h-[85vh] sm:h-full rounded-t-xl sm:rounded-none">
            <div className="sticky top-0 bg-white border-b border-stone-200 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl font-bold text-stone-900">{selectedOrder.id}</h2>
                <p className="text-sm text-stone-600">{selectedOrder.createdAt}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">
                  Order Status
                </label>
                <div className="flex items-center justify-between mb-4">
                  <StatusBadge status={selectedOrder.status} className="text-base px-4 py-2" />
                  {selectedOrder.fulfillmentMode === "delivery" && (
                    <div className="text-right">
                      <div className="text-sm font-medium text-stone-900 flex items-center justify-end gap-1.5">
                        {getStrategyIcon(selectedOrder.deliveryStrategy)}
                        {getStrategyLabel(selectedOrder.deliveryStrategy)}
                      </div>
                      <div className="text-xs text-stone-500">
                        {selectedOrder.driverStatus === "assigned"
                          ? `Driver: ${selectedOrder.driverName}`
                          : "Finding driver..."}
                      </div>
                    </div>
                  )}
                </div>

                {STATUS_ACTIONS[selectedOrder.status].length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-stone-200">
                    {STATUS_ACTIONS[selectedOrder.status].map((action) => (
                      <button
                        key={action}
                        onClick={() => updateOrderStatus(selectedOrder.id, action)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm flex-1 ${
                          action === "Canceled"
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-primary-600 text-white hover:bg-primary-700"
                        }`}
                      >
                        Mark as {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-stone-500" />
                  Customer Information
                </h3>
                <div className="space-y-3 text-sm bg-white border border-stone-100 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="text-stone-600">Name</span>
                    <span className="text-stone-900 font-medium">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="text-stone-600">Phone</span>
                    <span className="text-stone-900 font-medium">{selectedOrder.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-2">
                    <span className="text-stone-600">Type</span>
                    <span className="text-stone-900 font-medium">
                      {selectedOrder.fulfillmentMode === "delivery" ? "Delivery" : "Pickup"}
                    </span>
                  </div>
                  {selectedOrder.address && (
                    <div className="flex justify-between pt-1">
                      <span className="text-stone-600">Address</span>
                      <span className="text-stone-900 font-medium text-right max-w-[60%]">{selectedOrder.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-stone-500" />
                  Order Details
                </h3>
                <div className="space-y-0 text-sm bg-white border border-stone-100 rounded-xl overflow-hidden shadow-sm">
                  {selectedOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-4 border-b border-stone-100 last:border-0 hover:bg-stone-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-stone-100 rounded flex items-center justify-center font-bold text-stone-600 text-xs">
                          {item.quantity}x
                        </div>
                        <span className="text-stone-900 font-medium">{item.name}</span>
                      </div>
                    </div>
                  ))}
                  <div className="bg-stone-50 p-4 flex justify-between items-center">
                    <span className="font-semibold text-stone-900">Total</span>
                    <span className="text-xl font-bold text-primary-600">
                      ${selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
