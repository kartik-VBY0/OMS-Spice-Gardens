import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrderStatus } from '../api/orders';
import type { OrderDetails, OrderStatus } from '../types';
import StatusBadge from './StatusBadge';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

interface Props {
  order: OrderDetails;
  onBack: () => void;
}

export default function OrderDetailPanel({ order, onBack }: Props) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(order.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', order.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setError('');
    },
    onError: (err: unknown) => {
  const message =
    (err as { response?: { data?: { error?: { message?: string } } } })
      ?.response?.data?.error?.message ?? 'Failed to create order';
  setError(message);
},
  });

  const nextStatuses = ALLOWED_TRANSITIONS[order.status];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold text-gray-900">{order.orderNumber}</h2>
        <StatusBadge status={order.status} />
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
          Customer
        </h3>
        <div className="text-gray-900 font-medium">{order.customer.name}</div>
        <div className="text-sm text-gray-500">{order.customer.phone}</div>
        {order.customer.email && (
          <div className="text-sm text-gray-500">{order.customer.email}</div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
          Items
        </h3>
        <div className="divide-y divide-gray-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-2 flex justify-between text-sm">
              <div>
                <span className="font-medium text-gray-900">{item.itemName}</span>
                <span className="text-gray-400 ml-2">× {item.quantity}</span>
              </div>
              <div className="text-gray-700">₹{item.totalPrice.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>₹{order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Status Update */}
      {nextStatuses.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
            Update Status
          </h3>
          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}
          <div className="flex gap-2 flex-wrap">
            {nextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => statusMutation.mutate(status)}
                disabled={statusMutation.isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Move to {status}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}