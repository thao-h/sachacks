type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Ready"
  | "Out for Delivery"
  | "Delivered"
  | "Canceled";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<
  OrderStatus,
  { bg: string; text: string; dot: string }
> = {
  Pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    dot: "bg-yellow-500",
  },
  Confirmed: { bg: "bg-sky-50", text: "text-sky-600", dot: "bg-sky-600" },
  Preparing: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    dot: "bg-purple-500",
  },
  Ready: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" },
  "Out for Delivery": {
    bg: "bg-orange-50",
    text: "text-orange-600",
    dot: "bg-orange-500",
  },
  Delivered: {
    bg: "bg-green-50",
    text: "text-green-700",
    dot: "bg-green-600",
  },
  Canceled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}
