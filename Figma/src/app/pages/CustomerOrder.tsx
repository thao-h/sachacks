import { useState } from 'react';
import { Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Beef patty, lettuce, tomato, onion, pickles, special sauce',
    price: 12.99,
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'Chicken Sandwich',
    description: 'Crispy chicken, coleslaw, spicy mayo',
    price: 10.99,
    category: 'Sandwiches',
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'Caesar Salad',
    description: 'Romaine, parmesan, croutons, Caesar dressing',
    price: 8.99,
    category: 'Salads',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    name: 'Margherita Pizza',
    description: 'Tomato sauce, mozzarella, fresh basil',
    price: 14.99,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
  },
  {
    id: '5',
    name: 'French Fries',
    description: 'Crispy golden fries with sea salt',
    price: 4.99,
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
  },
  {
    id: '6',
    name: 'Chocolate Shake',
    description: 'Rich chocolate ice cream blended to perfection',
    price: 5.99,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop',
  },
];

export function CustomerOrder() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(MENU_ITEMS.map((item) => item.category)))];

  const filteredItems = selectedCategory === 'All' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter((item) => item.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  const getItemQuantity = (itemId: string) => {
    return cart.find((i) => i.id === itemId)?.quantity || 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    navigate('/checkout', { state: { cart, total: cartTotal } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">The Local Kitchen</h1>
            <p className="text-gray-600">Fresh food, delivered to your door</p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => {
              const quantity = getItemQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <span className="font-semibold text-blue-600">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    
                    {quantity === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 bg-white hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4 text-blue-600" />
                        </button>
                        <span className="font-semibold text-blue-600">{quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 bg-white hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4 text-blue-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Cart Summary - Desktop */}
        <div className="hidden lg:block w-96">
          <div className="sticky top-24">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
                <h2 className="font-semibold text-gray-900">Your Cart</h2>
                {cartItemCount > 0 && (
                  <span className="ml-auto bg-blue-100 text-blue-700 text-sm font-medium px-2 py-0.5 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="font-semibold text-gray-900">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Button */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={handleCheckout}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg flex items-center justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
            </span>
            <span className="font-semibold">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}