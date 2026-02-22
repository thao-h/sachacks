import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { CustomerOrder } from './pages/CustomerOrder';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { DispatchBoard } from './pages/DispatchBoard';
import { RootLayout } from './components/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: 'customer', Component: CustomerOrder },
      { path: 'checkout', Component: Checkout },
      { path: 'confirmation/:orderId', Component: OrderConfirmation },
      { path: 'restaurant', Component: RestaurantDashboard },
      { path: 'dispatch', Component: DispatchBoard },
    ],
  },
]);