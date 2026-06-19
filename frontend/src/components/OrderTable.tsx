import type { OrderDetails } from '../types';
import StatusBadge from './StatusBadge';

interface Props {
  orders: OrderDetails[];
  onSelect: (id: string) => void;
}

export default function OrderTable({ orders, onSelect }: Props) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        No orders found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">Order #</th>
            <th className="px-4 py-3 text-left">Customer</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Items</th>
            <th className="px-4 py-3 text-left">Total</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">
                {order.orderNumber}
              </td>
              <td className="px-4 py-3 text-gray-700">
                <div>{order.customer.name}</div>
                <div className="text-xs text-gray-400">{order.customer.phone}</div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-gray-600">{order.itemCount}</td>
              <td className="px-4 py-3 text-gray-900 font-medium">
                ₹{order.totalAmount.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('en-IN')}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onSelect(order.id)}
                  className="text-blue-600 hover:underline text-xs font-medium"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}