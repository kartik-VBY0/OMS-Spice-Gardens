import type { OrderStatus } from '../types';

const STATUSES: OrderStatus[] = [
  'CONFIRMED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED',
];

interface Props {
  value: OrderStatus | '';
  onChange: (value: OrderStatus | '') => void;
}

export default function StatusFilter({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as OrderStatus | '')}
      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All Statuses</option>
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}