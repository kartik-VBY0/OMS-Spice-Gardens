import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { createOrder } from '../api/orders';
import type { Customer } from '../types';

interface ItemRow {
  itemName: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  onClose: () => void;
  presetCustomer?: Customer;
}

export default function CreateOrderModal({ onClose, presetCustomer }: Props) {
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);
  const [useExisting, setUseExisting] = useState(!!presetCustomer);
  const [customerId, setCustomerId] = useState(presetCustomer?.id ?? '');
  const [name, setName] = useState(presetCustomer?.name ?? '');
  const [email, setEmail] = useState(presetCustomer?.email ?? '');
  const [phone, setPhone] = useState(presetCustomer?.phone ?? '');
  const [items, setItems] = useState<ItemRow[]>([{ itemName: '', quantity: 1, unitPrice: 0 }]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!modalRef.current) return;
    gsap.fromTo(
      modalRef.current,
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' }
    );
  }, []);

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
        'Failed to create order';
      setError(message);
    },
  });

  function addItem() {
    setItems([...items, { itemName: '', quantity: 1, unitPrice: 0 }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof ItemRow, value: string | number) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function handleSubmit() {
    setError('');

    if (useExisting && !customerId.trim()) {
      setError('Please enter a customer ID');
      return;
    }
    if (!name.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!phone.trim()) {
      setError('Customer phone is required');
      return;
    }
    if (items.some((item) => !item.itemName.trim())) {
      setError('All items must have a name');
      return;
    }

    mutation.mutate({
      customer: {
        id: useExisting ? customerId.trim() : null,
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim(),
      },
      items: items.map((item) => ({
        itemName: item.itemName.trim(),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    });
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/40 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div ref={modalRef} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl shadow-stone-950/20 sm:max-h-[90vh] sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-stone-200 p-4 sm:p-5">
          <h2 className="text-lg font-bold text-stone-950">Create New Order</h2>
          <button onClick={onClose} className="text-xl font-bold text-stone-400 hover:text-stone-600">
            ×
          </button>
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          <div>
            <div className="mb-3 grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              <button
                onClick={() => {
                  setUseExisting(false);
                  setCustomerId('');
                }}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
                  !useExisting
                    ? 'border-orange-600 bg-orange-600 text-white'
                    : 'border-stone-200 text-stone-600 hover:border-orange-200 hover:text-orange-700'
                }`}
              >
                New Customer
              </button>
              <button
                onClick={() => setUseExisting(true)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition-all sm:px-4 ${
                  useExisting
                    ? 'border-orange-600 bg-orange-600 text-white'
                    : 'border-stone-200 text-stone-600 hover:border-orange-200 hover:text-orange-700'
                }`}
              >
                Existing Customer
              </button>
            </div>

            {useExisting && (
              <div className="mb-2 space-y-2">
                {presetCustomer && (
                  <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-900">
                    Creating for <span className="font-bold">{presetCustomer.name}</span>
                  </div>
                )}
                <input
                  placeholder="Paste customer ID"
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                />
              </div>
            )}

            <div className="space-y-2">
              <input
                placeholder="Name *"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={useExisting && !!presetCustomer}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:bg-stone-50 disabled:text-stone-500"
              />
              <input
                placeholder="Phone *"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={useExisting && !!presetCustomer}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:bg-stone-50 disabled:text-stone-500"
              />
              <input
                placeholder="Email (optional)"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={useExisting && !!presetCustomer}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:bg-stone-50 disabled:text-stone-500"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-700">Items</span>
              <button onClick={addItem} className="text-xs font-semibold text-orange-700 hover:underline">
                + Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_72px] gap-2 sm:flex sm:items-center">
                  <input
                    placeholder="Item name"
                    value={item.itemName}
                    onChange={(event) => updateItem(index, 'itemName', event.target.value)}
                    className="min-w-0 rounded-2xl border border-stone-200 px-3 py-2 text-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100 sm:flex-1"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(event) => updateItem(index, 'quantity', Number(event.target.value))}
                    className="w-full rounded-2xl border border-stone-200 px-2 py-2 text-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100 sm:w-16"
                  />
                  <input
                    type="number"
                    min={0}
                    value={item.unitPrice}
                    onChange={(event) => updateItem(index, 'unitPrice', Number(event.target.value))}
                    className="w-full rounded-2xl border border-stone-200 px-2 py-2 text-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100 sm:w-24"
                  />
                  {items.length > 1 && (
                    <button onClick={() => removeItem(index)} className="w-fit text-lg font-bold text-red-400 hover:text-red-600">
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 text-right text-sm font-semibold text-stone-700">
              Total: ₹{total.toFixed(2)}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-stone-200 p-4 sm:flex-row sm:justify-end sm:p-5">
          <button onClick={onClose} className="rounded-2xl px-4 py-2 text-sm text-stone-600 hover:bg-stone-100">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="rounded-2xl bg-orange-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:-translate-y-0.5 hover:bg-orange-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
