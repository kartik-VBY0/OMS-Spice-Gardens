import type { OrderDetails } from '../types';
import StatusBadge from './StatusBadge';

interface Props {
  orders: OrderDetails[];
  onSelect: (id: string) => void;
  onSelectCustomer?: (id: string) => void;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OrderTable({ orders, onSelect, onSelectCustomer }: Props) {
  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white py-16 text-center text-sm text-stone-400">
        No orders found.
      </div>
    );
  }

  return (
    <>
    <div className="space-y-3 md:hidden">
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => onSelect(order.id)}
          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-lg shadow-stone-200/50"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <button
              onClick={(event) => { event.stopPropagation(); onSelect(order.id); }}
              className="break-all text-left font-bold text-orange-700"
            >
              {order.orderNumber}
            </button>
            <StatusBadge status={order.status} />
          </div>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onSelectCustomer?.(order.customer.id);
            }}
            className="mb-4 text-left"
          >
            <div className="font-semibold text-stone-950">{order.customer.name}</div>
            <div className="text-xs text-stone-400">{order.customer.phone}</div>
          </button>
          <div className="grid grid-cols-3 gap-3 border-t border-stone-100 pt-4 text-sm">
            <div>
              <div className="text-xs uppercase text-stone-400">Items</div>
              <div className="font-semibold">{order.itemCount}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-stone-400">Total</div>
              <div className="font-bold">{formatMoney(order.totalAmount)}</div>
            </div>
            <div>
              <div className="text-xs uppercase text-stone-400">Placed</div>
              <div className="text-stone-600">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="hidden overflow-x-auto rounded-3xl border border-stone-200 bg-white shadow-xl shadow-stone-200/50 md:block">
      <table className="min-w-[760px] text-sm lg:min-w-full">
        <thead className="border-b border-stone-200 bg-[#fffcf7] text-xs uppercase text-stone-500">
          <tr>
            <th className="px-6 py-4 text-left">Order</th>
            <th className="px-6 py-4 text-left">Customer</th>
            <th className="px-6 py-4 text-left">Status</th>
            <th className="px-6 py-4 text-left">Items</th>
            <th className="px-6 py-4 text-left">Total</th>
            <th className="px-6 py-4 text-left">Placed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 bg-white">
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => onSelect(order.id)}
              className="cursor-pointer transition-all hover:bg-orange-50/70"
            >
              <td className="px-6 py-5 font-bold text-orange-700">
                <button onClick={(event) => { event.stopPropagation(); onSelect(order.id); }}>
                  {order.orderNumber}
                </button>
              </td>
              <td className="px-6 py-5 text-stone-900">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectCustomer?.(order.customer.id);
                  }}
                  className="text-left font-semibold hover:text-orange-700"
                >
                  <div>{order.customer.name}</div>
                  <div className="text-xs font-normal text-stone-400">{order.customer.phone}</div>
                </button>
              </td>
              <td className="px-6 py-5">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-6 py-5 text-stone-600">{order.itemCount}</td>
              <td className="px-6 py-5 font-bold text-stone-950">
                {formatMoney(order.totalAmount)}
              </td>
              <td className="px-6 py-5 text-stone-500">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  );
}
