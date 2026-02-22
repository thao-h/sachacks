import { MapPin, ChevronRight, ShoppingBag, Car, Users } from 'lucide-react';
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
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Left Content */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              {/* Logo and Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40 rounded-full"></div>
                    <MapPin className="w-10 h-10 text-blue-600 relative" strokeWidth={2.5} />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">DDBA</h1>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                  Local Delivery OS
                </h2>
                
                <p className="text-lg text-gray-600 font-medium">
                  Community-powered delivery for Davis
                </p>
              </motion.div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link 
                  to="/customer"
                  className="group w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-4 px-6 font-semibold transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-5 h-5" />
                    Order Food
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>

                <div className="grid grid-cols-2 gap-4">
                  <Link 
                    to="/driver"
                    className="group w-full bg-white hover:bg-gray-50 text-gray-900 rounded-xl py-4 px-4 font-semibold transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col items-start gap-2"
                  >
                    <Car className="w-6 h-6 text-blue-600 mb-1" />
                    <span>Drive & Earn</span>
                  </Link>

                  <Link 
                    to="/communities"
                    className="group w-full bg-white hover:bg-gray-50 text-gray-900 rounded-xl py-4 px-4 font-semibold transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col items-start gap-2"
                  >
                    <Users className="w-6 h-6 text-green-600 mb-1" />
                    <span>My Communities</span>
                  </Link>
                </div>
              </div>

              <div className="mt-8 text-center md:text-left">
                <Link to="/restaurant" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                  For Restaurants & Dispatchers →
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-64 md:h-auto bg-blue-50">
              <img 
                src="https://images.unsplash.com/photo-1717250265987-b5c58bb96b8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb21tdW5pdHklMjBkZWxpdmVyeSUyMGlsbHVzdHJhdGlvbiUyMG9yJTIwdmVjdG9yJTIwYXJ0fGVufDF8fHx8MTc3MTcyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                alt="Community Delivery" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:bg-gradient-to-l md:from-transparent md:to-white/10" />
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}