import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { addOrderItem, deleteOrderItem, updateOrderStatus } from '../api/orders';
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

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function errorMessage(err: unknown, fallback: string) {
  return (
    (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
    fallback
  );
}

export default function OrderDetailPanel({ order, onBack }: Props) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(
      panelRef.current.querySelectorAll('.detail-card'),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power3.out' }
    );
  }, [order.id]);

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(order.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', order.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setError('');
    },
    onError: (err: unknown) => setError(errorMessage(err, 'Failed to update status')),
  });

  const addItemMutation = useMutation({
    mutationFn: () => addOrderItem(order.id, { itemName: itemName.trim(), quantity, unitPrice }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', order.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setItemName('');
      setQuantity(1);
      setUnitPrice(0);
      setError('');
    },
    onError: (err: unknown) => setError(errorMessage(err, 'Failed to add item')),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => deleteOrderItem(order.id, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', order.id] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setError('');
    },
    onError: (err: unknown) => setError(errorMessage(err, 'Failed to delete item')),
  });

  const nextStatuses = ALLOWED_TRANSITIONS[order.status];

  function handleAddItem() {
    setError('');
    if (!itemName.trim()) {
      setError('Item name is required');
      return;
    }
    if (quantity < 1) {
      setError('Quantity must be at least 1');
      return;
    }
    if (unitPrice < 0) {
      setError('Unit price cannot be negative');
      return;
    }
    addItemMutation.mutate();
  }

  return (
    <div ref={panelRef}>
      <button onClick={onBack} className="mb-6 text-sm font-semibold text-stone-500 hover:text-orange-700">
        ← Back to orders
      </button>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="break-all text-2xl font-bold tracking-tight sm:text-3xl">{order.orderNumber}</h2>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-sm text-stone-600">
          Placed {new Date(order.createdAt).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8">
        <div className="space-y-8">
          <section className="detail-card overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-200/50 sm:rounded-3xl">
            <div className="border-b border-stone-200 px-4 py-4 sm:px-6 sm:py-5">
              <h3 className="text-xl font-bold">Items</h3>
            </div>
            <div className="hidden grid-cols-[1fr_80px_120px_120px_44px] gap-4 px-6 py-4 text-xs font-bold uppercase text-stone-500 sm:grid">
              <span>Item</span>
              <span>Qty</span>
              <span>Unit</span>
              <span>Total</span>
              <span />
            </div>
            {order.items.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 border-t border-stone-100 px-4 py-4 sm:grid-cols-[1fr_80px_120px_120px_44px] sm:items-center sm:gap-4 sm:px-6 sm:py-5"
              >
                <span className="font-semibold">{item.itemName}</span>
                <div className="grid grid-cols-3 gap-3 text-sm sm:contents">
                  <span className="text-stone-600">x{item.quantity}</span>
                  <span className="text-stone-600">{formatMoney(item.unitPrice)}</span>
                  <span className="font-bold">{formatMoney(item.totalPrice)}</span>
                </div>
                <button
                  onClick={() => deleteItemMutation.mutate(item.id)}
                  disabled={deleteItemMutation.isPending}
                  className="w-fit rounded-xl px-2 py-1 text-stone-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-40 sm:w-auto"
                  title="Delete item"
                >
                  🗑
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-stone-200 bg-[#fffcf7] px-4 py-4 sm:px-6 sm:py-5">
              <span className="text-stone-600">Order total</span>
              <span className="text-xl font-bold sm:text-2xl">{formatMoney(order.totalAmount)}</span>
            </div>
          </section>

          <section className="detail-card rounded-2xl border border-stone-200 bg-white p-4 shadow-xl shadow-stone-200/50 sm:rounded-3xl sm:p-6">
            <h3 className="mb-5 text-xl font-bold">Add item</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_160px_210px_120px] lg:items-end">
              <label className="space-y-2">
                <span className="text-sm font-semibold">Item name</span>
                <input
                  value={itemName}
                  onChange={(event) => setItemName(event.target.value)}
                  placeholder="e.g. Masala Dosa"
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 shadow-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold">Qty</span>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 shadow-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold">Unit price (₹)</span>
                <input
                  type="number"
                  min={0}
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(Number(event.target.value))}
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 shadow-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                />
              </label>
              <button
                onClick={handleAddItem}
                disabled={addItemMutation.isPending}
                className="rounded-2xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:-translate-y-0.5 hover:bg-orange-700 disabled:opacity-50 sm:col-span-2 lg:col-span-1"
              >
                + Add
              </button>
            </div>
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          </section>
        </div>

        <aside className="space-y-6 xl:space-y-8">
          <section className="detail-card rounded-2xl border border-stone-200 bg-white p-4 shadow-xl shadow-stone-200/50 sm:rounded-3xl sm:p-6">
            <h3 className="mb-5 text-xl font-bold">Customer</h3>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-xl">◎</div>
              <div>
                <div className="break-words font-bold">{order.customer.name}</div>
                <div className="mt-3 space-y-2 break-words text-sm text-stone-600">
                  <div>☎ {order.customer.phone}</div>
                  {order.customer.email && <div>✉ {order.customer.email}</div>}
                </div>
              </div>
            </div>
          </section>

          <section className="detail-card rounded-2xl border border-stone-200 bg-white p-4 shadow-xl shadow-stone-200/50 sm:rounded-3xl sm:p-6">
            <h3 className="mb-3 text-xl font-bold">Update status</h3>
            <div className="mb-5 flex items-center gap-2 text-sm text-stone-600">
              Current:
              <StatusBadge status={order.status} />
            </div>
            {nextStatuses.length === 0 && (
              <p className="text-sm text-stone-500">This order is already in a final state.</p>
            )}
            <div className="space-y-3">
              {nextStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => statusMutation.mutate(status)}
                  disabled={statusMutation.isPending}
                  className={`w-full rounded-2xl px-5 py-3 text-left font-semibold shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-50 ${
                    status === 'CANCELLED'
                      ? 'border border-red-200 bg-white text-red-600 hover:bg-red-50'
                      : 'bg-orange-600 text-white shadow-orange-600/20 hover:bg-orange-700'
                  }`}
                >
                  Mark as {status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
