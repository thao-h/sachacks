import { Outlet } from 'react-router';
import { Header } from './Header';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Outlet />
    </div>
  );
}
