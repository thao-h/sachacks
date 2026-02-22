import { Car, Users, Bike, Store, Info } from 'lucide-react';

export type DeliveryOptionType = 'route-match' | 'community-batch' | 'direct-courier' | 'pickup';

interface DeliveryOption {
  id: DeliveryOptionType;
  title: string;
  price: number;
  subtitle: string;
  icon: React.ElementType;
  available: boolean;
  unavailableReason?: string;
  eta: string;
}

interface DeliveryOptionsProps {
  selectedOption: DeliveryOptionType;
  onSelect: (option: DeliveryOptionType) => void;
  communityActive?: boolean; // simulating if user is in a community with active orders
}

export function DeliveryOptions({ selectedOption, onSelect, communityActive = false }: DeliveryOptionsProps) {
  const options: DeliveryOption[] = [
    {
      id: 'route-match',
      title: 'Route Match',
      price: 1.50,
      subtitle: 'Someone\'s heading your way',
      icon: Car,
      available: true, // Mock availability
      eta: '45-60 min'
    },
    {
      id: 'community-batch',
      title: 'Community Batch',
      price: 2.00,
      subtitle: 'Split with neighbors',
      icon: Users,
      available: communityActive,
      unavailableReason: 'No active batches nearby',
      eta: '30-45 min'
    },
    {
      id: 'direct-courier',
      title: 'Direct Courier',
      price: 5.99,
      subtitle: 'Guaranteed 30 min',
      icon: Bike,
      available: true,
      eta: '25-30 min'
    },
    {
      id: 'pickup',
      title: 'Pickup',
      price: 0,
      subtitle: 'Ready in 15-20 min',
      icon: Store,
      available: true,
      eta: '15-20 min'
    }
  ];

  const selected = options.find(o => o.id === selectedOption);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedOption === option.id;
          const isDisabled = !option.available;

          return (
            <button
              key={option.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(option.id)}
              className={`relative flex flex-col p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              } ${isDisabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}`}
            >
              <div className="flex justify-between items-start w-full mb-2">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-gray-900">
                  {option.price === 0 ? 'Free' : `$${option.price.toFixed(2)}`}
                </div>
              </div>
              
              <div className="font-semibold text-gray-900 mb-0.5">{option.title}</div>
              <div className="text-xs text-gray-500 line-clamp-2">
                {isDisabled && option.unavailableReason ? option.unavailableReason : option.subtitle}
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          <Info className="w-4 h-4" />
          <span className="font-medium">Estimated arrival: {selected.eta}</span>
        </div>
      )}
    </div>
  );
}