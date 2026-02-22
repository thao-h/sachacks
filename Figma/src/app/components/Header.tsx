import { MapPin, User, ChevronDown, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useState } from 'react';

export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const links = [
    { path: '/customer', label: 'Order' },
    { path: '/driver', label: 'Drive' },
    { path: '/communities', label: 'Communities' },
    { path: '/routes', label: 'Routes' },
  ];

  const getCurrentRole = () => {
    if (location.pathname.startsWith('/driver')) return { label: 'Driver Mode', color: 'bg-green-100 text-green-700' };
    if (location.pathname.startsWith('/restaurant')) return { label: 'Restaurant Mode', color: 'bg-orange-100 text-orange-700' };
    if (location.pathname.startsWith('/dispatch')) return { label: 'Dispatch Mode', color: 'bg-purple-100 text-purple-700' };
    return { label: 'Ordering', color: 'bg-blue-100 text-blue-700' };
  };

  const role = getCurrentRole();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">DDBA</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 mx-4">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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

          {/* Right Section: Role & Profile */}
          <div className="flex items-center gap-3">
            {/* Role Indicator */}
            <div className={`hidden sm:flex px-3 py-1 rounded-full text-xs font-bold items-center gap-1.5 ${role.color}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {role.label}
            </div>

            {/* Profile Dropdown Mock */}
            <button className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full left-0 shadow-lg">
          <div className="p-2 space-y-1">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
             <div className="mt-2 pt-2 border-t border-gray-100 px-4 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Current Mode</div>
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold items-center gap-1.5 ${role.color}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  {role.label}
                </div>
             </div>
          </div>
        </div>
      )}
    </header>
  );
}