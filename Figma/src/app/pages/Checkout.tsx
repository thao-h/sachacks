import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart = [], total = 0 } = (location.state as { cart: CartItem[]; total: number }) || {};

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    fulfillmentMode: 'delivery',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = 'ORD' + Date.now().toString().slice(-6);
    navigate(`/confirmation/${orderId}`, {
      state: { ...formData, cart, total, orderId },
    });
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <button
          onClick={() => navigate('/customer')}
          className="text-blue-600 hover:text-blue-700"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/customer')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Delivery Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1.5">
                Delivery Address
              </label>
              <textarea
                id="address"
                required={formData.fulfillmentMode === 'delivery'}
                disabled={formData.fulfillmentMode === 'pickup'}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="123 Main St, Apt 4B"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Fulfillment Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, fulfillmentMode: 'delivery' })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.fulfillmentMode === 'delivery'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, fulfillmentMode: 'pickup' })}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.fulfillmentMode === 'pickup'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pickup
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Place Order
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-6">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            {cart.map((item: CartItem) => (
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

          <div className="border-t border-gray-200 pt-4 space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="text-gray-900">
                {formData.fulfillmentMode === 'delivery' ? '$2.99' : '$0.00'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">${(total * 0.08).toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-blue-600">
                ${(total + (formData.fulfillmentMode === 'delivery' ? 2.99 : 0) + total * 0.08).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
