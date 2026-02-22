import { useLocation, useParams, Link } from 'react-router';
import { CheckCircle2, Clock, Package, Truck, Home } from 'lucide-react';

export function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const orderData = location.state || {};

  const statusSteps = [
    { label: 'Pending', icon: Clock, status: 'complete' },
    { label: 'Confirmed', icon: CheckCircle2, status: 'complete' },
    { label: 'Preparing', icon: Package, status: 'current' },
    { label: orderData.fulfillmentMode === 'delivery' ? 'Out for Delivery' : 'Ready', icon: Truck, status: 'pending' },
    { label: orderData.fulfillmentMode === 'delivery' ? 'Delivered' : 'Picked Up', icon: Home, status: 'pending' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Thank you for your order, {orderData.name || 'valued customer'}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-xl font-bold text-gray-900">{orderId}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">
              {orderData.fulfillmentMode === 'delivery' ? 'Delivery' : 'Pickup'}
            </p>
            <p className="font-semibold text-gray-900">
              {orderData.fulfillmentMode === 'delivery' ? 'Est. 30-45 min' : 'Est. 15-20 min'}
            </p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
              <div className="absolute inset-0 bg-blue-600 w-1/4 transition-all duration-500"></div>
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                        step.status === 'complete'
                          ? 'bg-blue-600 text-white'
                          : step.status === 'current'
                          ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-50'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p
                      className={`text-xs text-center max-w-20 ${
                        step.status === 'pending' ? 'text-gray-400' : 'text-gray-700'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
          
          <div className="space-y-3 mb-4">
            {orderData.cart?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantity}× {item.name}
                </span>
                <span className="text-gray-900 font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-blue-600">
                ${(
                  (orderData.total || 0) +
                  (orderData.fulfillmentMode === 'delivery' ? 2.99 : 0) +
                  (orderData.total || 0) * 0.08
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {orderData.fulfillmentMode === 'delivery' && orderData.address && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
            <p className="text-gray-600">{orderData.address}</p>
          </div>
        )}

        {orderData.phone && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-2">Contact</h3>
            <p className="text-gray-600">{orderData.phone}</p>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <Link
          to="/customer"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center font-medium transition-colors"
        >
          Order Again
        </Link>
        <Link
          to="/"
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 py-3 px-4 rounded-lg text-center font-medium transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
