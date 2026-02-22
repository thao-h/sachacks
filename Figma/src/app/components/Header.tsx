import { MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export function Header() {
  const location = useLocation();

  const links = [
    { path: '/customer', label: 'Browse Menu', role: 'customer' },
    { path: '/restaurant', label: 'Restaurant', role: 'restaurant' },
    { path: '/dispatch', label: 'Dispatch', role: 'dispatch' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">DDBA</span>
          </Link>

          <nav className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
