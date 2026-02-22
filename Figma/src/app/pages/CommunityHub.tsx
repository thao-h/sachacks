import { useState } from 'react';
import { Search, Users, MapPin, ShoppingBag, ChevronRight, UserPlus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Community {
  id: string;
  name: string;
  memberCount: number;
  activeNow: number;
  area: string;
  joined: boolean;
  imageColor: string;
}

const MOCK_COMMUNITIES: Community[] = [
  {
    id: 'c1',
    name: 'The Colleges Apartments',
    memberCount: 342,
    activeNow: 3,
    area: '95616',
    joined: false,
    imageColor: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'c2',
    name: 'West Davis Neighbors',
    memberCount: 128,
    activeNow: 5,
    area: '95616',
    joined: true,
    imageColor: 'bg-green-100 text-green-600',
  },
  {
    id: 'c3',
    name: 'El Macero Country Club',
    memberCount: 89,
    activeNow: 0,
    area: '95618',
    joined: false,
    imageColor: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'c4',
    name: 'Downtown Davis',
    memberCount: 567,
    activeNow: 12,
    area: '95616',
    joined: false,
    imageColor: 'bg-purple-100 text-purple-600',
  },
];

export function CommunityHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [communities, setCommunities] = useState(MOCK_COMMUNITIES);

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.area.includes(searchTerm)
  );

  const handleJoin = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, joined: !c.joined } : c))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Community Hub</h1>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Find communities by name or zip..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCommunities.map((community) => (
            <motion.div
              key={community.id}
              layoutId={`card-${community.id}`}
              onClick={() => setSelectedCommunity(community)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-blue-200 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${community.imageColor}`}>
                  <Users className="w-6 h-6" />
                </div>
                <button
                  onClick={(e) => handleJoin(e, community.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    community.joined
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {community.joined ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Joined
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" /> Join
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                {community.name}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <MapPin className="w-3.5 h-3.5" />
                {community.area}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{community.memberCount}</span> members
                </div>
                {community.activeNow > 0 && (
                  <div className="flex items-center gap-1.5 text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {community.activeNow} ordering now
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {selectedCommunity && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCommunity(null)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            <motion.div
              layoutId={`card-${selectedCommunity.id}`}
              className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] bg-white rounded-t-2xl md:rounded-2xl z-50 overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
            >
              <div className="p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCommunity.name}</h2>
                  <button 
                    onClick={() => setSelectedCommunity(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 rotate-90 md:rotate-0 text-gray-400" />
                  </button>
                </div>

                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Active Group Orders
                  </h3>
                  
                  {selectedCommunity.activeNow > 0 ? (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <ShoppingBag className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">Dos Coyotes Border Cafe</div>
                          <div className="text-sm text-blue-600 font-medium">Ordering closes in 15m</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-2">
                          +2 others form your community
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-white/60 rounded-lg p-3 mb-4">
                        <span className="text-sm text-gray-700">Estimated savings</span>
                        <span className="font-bold text-green-600">~$2.50 each</span>
                      </div>

                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-sm">
                        Join Group Order
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-500 mb-2">No active group orders</p>
                      <button className="text-blue-600 font-medium hover:underline">
                        Start one now
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                    Members ({selectedCommunity.memberCount})
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto mb-2" />
                        <div className="h-2 w-16 bg-gray-100 rounded mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}