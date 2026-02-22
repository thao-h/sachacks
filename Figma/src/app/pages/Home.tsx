import { MapPin, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';

export function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-500/10 p-12 md:p-16">
          {/* Logo and Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40 rounded-full"></div>
                <MapPin className="w-12 h-12 text-blue-600 relative" strokeWidth={2.5} />
              </div>
              <h1 className="text-5xl font-bold text-gray-900">DDBA</h1>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              DDBA Local Delivery OS
            </h2>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Local delivery operations platform for restaurants.
            </p>
          </motion.div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* For Customers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
                  For Customers
                </h3>
                <Link 
                  to="/customer"
                  className="group relative w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl py-4 px-6 font-semibold transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Browse Menu
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </motion.div>

            {/* For Restaurants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
                  For Restaurants
                </h3>
                <Link 
                  to="/restaurant"
                  className="group w-full bg-white hover:bg-gray-50 text-gray-900 rounded-xl py-4 px-6 font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Dashboard
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </motion.div>

            {/* For Dispatchers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="text-center">
                <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
                  For Dispatchers
                </h3>
                <Link 
                  to="/dispatch"
                  className="group w-full bg-white hover:bg-gray-50 text-gray-900 rounded-xl py-4 px-6 font-semibold transition-all duration-300 border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Live Board
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
