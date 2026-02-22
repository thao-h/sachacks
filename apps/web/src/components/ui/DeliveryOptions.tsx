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
}

interface DeliveryOptionsProps {
  selectedOption: DeliveryOptionType;
  onSelect: (option: DeliveryOptionType) => void;
  communityActive?: boolean;
  distanceMiles?: number;
}

export function DeliveryOptions({
  selectedOption,
  onSelect,
  communityActive = false,
  distanceMiles = 0,
}: DeliveryOptionsProps) {
  const roundedMiles = Number.isFinite(distanceMiles)
    ? Math.max(0, distanceMiles)
    : 0;

  const getEta = (optionId: DeliveryOptionType): string => {
    switch (optionId) {
      case "route-match":
        return `${Math.round(35 + 4 * roundedMiles)} min`;
      case "community-batch":
        return `${Math.round(30 + 3.5 * roundedMiles)} min`;
      case "direct-courier":
        return `${Math.round(20 + 3 * roundedMiles)} min`;
      case "pickup":
        return "15-20 min";
      default:
        return "N/A";
    }
  };

  const options: DeliveryOption[] = [
    {
      id: "route-match",
      title: "Route Match",
      price: 1.5,
      subtitle: "Someone's heading your way",
      icon: Car,
      available: true,
    },
    {
      id: "community-batch",
      title: "Community Batch",
      price: 2.0,
      subtitle: "Split with neighbors",
      icon: Users,
      available: communityActive,
      unavailableReason: "No active batches nearby",
    },
    {
      id: "direct-courier",
      title: "Direct Courier",
      price: 5.99,
      subtitle: "Guaranteed 30 min",
      icon: Bike,
      available: true,
    },
    {
      id: "pickup",
      title: "Pickup",
      price: 0,
      subtitle: "Ready in 15-20 min",
      icon: Store,
      available: true,
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
            Estimated arrival: {getEta(selected.id)}
          </span>
        </div>
      )}
    </div>
  );
}
