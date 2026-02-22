import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Preparing' 
  | 'Ready' 
  | 'Out for Delivery' 
  | 'Delivered' 
  | 'Canceled';

interface Order {
  id: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  total: number;
  status: OrderStatus;
  fulfillmentMode: 'delivery' | 'pickup';
  address?: string;
  phone: string;
  createdAt: string;
  isPriority?: boolean;
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD001',
    customerName: 'John Doe',
    items: [
      { name: 'Classic Burger', quantity: 2 },
      { name: 'French Fries', quantity: 1 },
    ],
    total: 30.97,
    status: 'Pending',
    fulfillmentMode: 'delivery',
    address: '123 Main St, Apt 4B',
    phone: '(555) 123-4567',
    createdAt: '2:45 PM',
    isPriority: true,
  },
  {
    id: 'ORD002',
    customerName: 'Jane Smith',
    items: [
      { name: 'Margherita Pizza', quantity: 1 },
      { name: 'Caesar Salad', quantity: 1 },
    ],
    total: 25.98,
    status: 'Confirmed',
    fulfillmentMode: 'pickup',
    phone: '(555) 234-5678',
    createdAt: '2:30 PM',
  },
  {
    id: 'ORD003',
    customerName: 'Mike Johnson',
    items: [
      { name: 'Chicken Sandwich', quantity: 3 },
      { name: 'Chocolate Shake', quantity: 2 },
    ],
    total: 44.95,
    status: 'Preparing',
    fulfillmentMode: 'delivery',
    address: '456 Oak Ave, Suite 12',
    phone: '(555) 345-6789',
    createdAt: '2:15 PM',
  },
  {
    id: 'ORD004',
    customerName: 'Sarah Williams',
    items: [{ name: 'Caesar Salad', quantity: 2 }],
    total: 19.98,
    status: 'Ready',
    fulfillmentMode: 'pickup',
    phone: '(555) 456-7890',
    createdAt: '2:00 PM',
  },
  {
    id: 'ORD005',
    customerName: 'Tom Brown',
    items: [
      { name: 'Classic Burger', quantity: 1 },
      { name: 'French Fries', quantity: 1 },
    ],
    total: 19.98,
    status: 'Out for Delivery',
    fulfillmentMode: 'delivery',
    address: '789 Elm St',
    phone: '(555) 567-8901',
    createdAt: '1:45 PM',
  },
  {
    id: 'ORD006',
    customerName: 'Emily Davis',
    items: [{ name: 'Margherita Pizza', quantity: 2 }],
    total: 31.98,
    status: 'Delivered',
    fulfillmentMode: 'delivery',
    address: '321 Pine Rd',
    phone: '(555) 678-9012',
    createdAt: '1:30 PM',
  },
];

const STATUS_FILTERS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Ready',
  'Out for Delivery',
  'Delivered',
  'Canceled',
];

const STATUS_ACTIONS: Record<OrderStatus, OrderStatus[]> = {
  'Pending': ['Confirmed', 'Canceled'],
  'Confirmed': ['Preparing', 'Canceled'],
  'Preparing': ['Ready', 'Canceled'],
  'Ready': ['Out for Delivery', 'Delivered'],
  'Out for Delivery': ['Delivered', 'Canceled'],
  'Delivered': [],
  'Canceled': [],
};

export function RestaurantDashboard() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = selectedStatus === 'All'
    ? orders
    : orders.filter((order) => order.status === selectedStatus);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const getStatusCount = (status: string) => {
    if (status === 'All') return orders.length;
    return orders.filter((order) => order.status === status).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Dashboard</h1>
        <p className="text-gray-600">Manage incoming orders and update their status</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedStatus('All')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
              selectedStatus === 'All'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            All Orders
            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full">
              {getStatusCount('All')}
            </span>
          </button>
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status}
              {getStatusCount(status) > 0 && (
                <span className="bg-blue-700 text-white text-xs px-2 py-0.5 rounded-full">
                  {getStatusCount(status)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className={`bg-white rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
              order.isPriority
                ? 'border-orange-400 ring-2 ring-orange-100'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedOrder(order)}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900">{order.id}</h3>
                    {order.isPriority && (
                      <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{order.customerName}</p>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="space-y-1 mb-3">
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-sm text-gray-600">
                    {item.quantity}× {item.name}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">{order.createdAt}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    {order.fulfillmentMode === 'delivery' ? '🚗 Delivery' : '🏪 Pickup'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No orders found for this status</p>
        </div>
      )}

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-end">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-white w-full sm:w-[480px] sm:h-full sm:shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedOrder.id}</h2>
                <p className="text-sm text-gray-600">{selectedOrder.createdAt}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status
                </label>
                <StatusBadge status={selectedOrder.status} className="text-base px-4 py-2" />
              </div>

              {/* Update Status Actions */}
              {STATUS_ACTIONS[selectedOrder.status].length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Update Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_ACTIONS[selectedOrder.status].map((action) => (
                      <button
                        key={action}
                        onClick={() => updateOrderStatus(selectedOrder.id, action)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          action === 'Canceled'
                            ? 'bg-red-50 text-red-700 hover:bg-red-100'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        Mark as {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 text-gray-900 font-medium">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 text-gray-900 font-medium">{selectedOrder.phone}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mode:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {selectedOrder.fulfillmentMode === 'delivery' ? 'Delivery' : 'Pickup'}
                    </span>
                  </div>
                  {selectedOrder.address && (
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <span className="ml-2 text-gray-900 font-medium">{selectedOrder.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2">
                      <span className="text-gray-900">
                        {item.quantity}× {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
