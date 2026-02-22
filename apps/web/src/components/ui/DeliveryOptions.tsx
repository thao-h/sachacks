"use client";

import { Car, Users, Bike, Store, Info } from "lucide-react";

export type DeliveryOptionType =
  | "route-match"
  | "community-batch"
  | "direct-courier"
  | "pickup";

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
  communityActive?: boolean;
}

export function DeliveryOptions({
  selectedOption,
  onSelect,
  communityActive = false,
}: DeliveryOptionsProps) {
  const options: DeliveryOption[] = [
    {
      id: "route-match",
      title: "Route Match",
      price: 1.5,
      subtitle: "Someone's heading your way",
      icon: Car,
      available: true,
      eta: "45-60 min",
    },
    {
      id: "community-batch",
      title: "Community Batch",
      price: 2.0,
      subtitle: "Split with neighbors",
      icon: Users,
      available: communityActive,
      unavailableReason: "No active batches nearby",
      eta: "30-45 min",
    },
    {
      id: "direct-courier",
      title: "Direct Courier",
      price: 5.99,
      subtitle: "Guaranteed 30 min",
      icon: Bike,
      available: true,
      eta: "25-30 min",
    },
    {
      id: "pickup",
      title: "Pickup",
      price: 0,
      subtitle: "Ready in 15-20 min",
      icon: Store,
      available: true,
      eta: "15-20 min",
    },
  ];

  const selected = options.find((o) => o.id === selectedOption);

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
                  ? "border-primary-600 bg-primary-50/50"
                  : "border-stone-200 bg-white hover:border-stone-300"
              } ${isDisabled ? "opacity-60 cursor-not-allowed bg-stone-50" : "cursor-pointer"}`}
            >
              <div className="flex justify-between items-start w-full mb-2">
                <div
                  className={`p-2 rounded-lg ${isSelected ? "bg-primary-100 text-primary-600" : "bg-stone-100 text-stone-600"}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-stone-900">
                  {option.price === 0 ? "Free" : `$${option.price.toFixed(2)}`}
                </div>
              </div>

              <div className="font-semibold text-stone-900 mb-0.5">
                {option.title}
              </div>
              <div className="text-xs text-stone-500 line-clamp-2">
                {isDisabled && option.unavailableReason
                  ? option.unavailableReason
                  : option.subtitle}
              </div>

              {isSelected && (
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-primary-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="flex items-center gap-2 text-sm text-primary-700 bg-primary-50 px-3 py-2 rounded-lg border border-primary-100">
          <Info className="w-4 h-4" />
          <span className="font-medium">
            Estimated arrival: {selected.eta}
          </span>
        </div>
      )}
    </div>
  );
}
