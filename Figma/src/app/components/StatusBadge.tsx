import { cn } from './ui/utils';

type OrderStatus = 
  | 'Pending' 
  | 'Confirmed' 
  | 'Preparing' 
  | 'Ready' 
  | 'Out for Delivery' 
  | 'Delivered' 
  | 'Canceled';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
  'Pending': {
    bg: 'bg-[--status-pending-bg]',
    text: 'text-[--status-pending]',
    dot: 'bg-[--status-pending]',
  },
  'Confirmed': {
    bg: 'bg-[--status-confirmed-bg]',
    text: 'text-[--status-confirmed]',
    dot: 'bg-[--status-confirmed]',
  },
  'Preparing': {
    bg: 'bg-[--status-preparing-bg]',
    text: 'text-[--status-preparing]',
    dot: 'bg-[--status-preparing]',
  },
  'Ready': {
    bg: 'bg-[--status-ready-bg]',
    text: 'text-[--status-ready]',
    dot: 'bg-[--status-ready]',
  },
  'Out for Delivery': {
    bg: 'bg-[--status-delivering-bg]',
    text: 'text-[--status-delivering]',
    dot: 'bg-[--status-delivering]',
  },
  'Delivered': {
    bg: 'bg-[--status-delivered-bg]',
    text: 'text-[--status-delivered]',
    dot: 'bg-[--status-delivered]',
  },
  'Canceled': {
    bg: 'bg-[--status-canceled-bg]',
    text: 'text-[--status-canceled]',
    dot: 'bg-[--status-canceled]',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {status}
    </span>
  );
}
