import type { OrderStatus } from '../types';

interface Props {
  status: OrderStatus;
}

const styles: Record<OrderStatus, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-yellow-100 text-yellow-700',
  READY: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
};

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}