import { createBrowserRouter } from 'react-router';
import { Home } from './pages/Home';
import { CustomerOrder } from './pages/CustomerOrder';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { DispatchBoard } from './pages/DispatchBoard';
import { DriverDashboard } from './pages/DriverDashboard';
import { CommunityHub } from './pages/CommunityHub';
import { RouteBoard } from './pages/RouteBoard';
import { RootLayout } from './components/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: 'customer', Component: CustomerOrder },
      { path: 'checkout', Component: Checkout },
      { path: 'track/:orderId', Component: OrderConfirmation },
      { path: 'confirmation/:orderId', Component: OrderConfirmation }, // Alias for backward compatibility if needed
      { path: 'restaurant', Component: RestaurantDashboard },
      { path: 'dispatch', Component: DispatchBoard },
      { path: 'driver', Component: DriverDashboard },
      { path: 'communities', Component: CommunityHub },
      { path: 'routes', Component: RouteBoard },
    ],
  },
]);