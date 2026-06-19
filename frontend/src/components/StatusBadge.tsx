import type { OrderStatus } from '../types';

interface Props {
  status: OrderStatus;
}

const styles: Record<OrderStatus, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-700 before:bg-blue-600',
  PREPARING: 'bg-amber-100 text-amber-700 before:bg-amber-600',
  READY: 'bg-emerald-100 text-emerald-700 before:bg-emerald-600',
  COMPLETED: 'bg-stone-100 text-stone-600 before:bg-stone-500',
  CANCELLED: 'bg-red-100 text-red-600 before:bg-red-500',
};

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold capitalize before:h-2 before:w-2 before:rounded-full ${styles[status]}`}
    >
      {status.toLowerCase()}
    </span>
  );
}
