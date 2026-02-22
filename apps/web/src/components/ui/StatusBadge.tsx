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
    bg: "bg-accent-100",
    text: "text-accent-900",
    dot: "bg-accent-500",
  },
  Confirmed: { bg: "bg-teal-100", text: "text-teal-800", dot: "bg-teal-600" },
  Preparing: {
    bg: "bg-primary-100",
    text: "text-primary-800",
    dot: "bg-primary-600",
  },
  Ready: { bg: "bg-sage-100", text: "text-sage-800", dot: "bg-sage-600" },
  "Out for Delivery": {
    bg: "bg-pop-100",
    text: "text-pop-800",
    dot: "bg-pop-600",
  },
  Delivered: {
    bg: "bg-sage-100",
    text: "text-sage-900",
    dot: "bg-sage-700",
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
