import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../api/orders';

interface ItemRow {
  itemName: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
  onClose: () => void;
}

export default function CreateOrderModal({ onClose }: Props) {
  const queryClient = useQueryClient();

  // Customer fields
  const [useExisting, setUseExisting] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Items
  const [items, setItems] = useState<ItemRow[]>([
    { itemName: '', quantity: 1, unitPrice: 0 },
  ]);

  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    },
    onError: (err: unknown) => {
  const message =
    (err as { response?: { data?: { error?: { message?: string } } } })
      ?.response?.data?.error?.message ?? 'Failed to create order';
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
    setItems(items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ));
  }

  function handleSubmit() {
    setError('');

    if (useExisting && !customerId.trim()) {
      setError('Please enter a customer ID');
      return;
    }
    if (!useExisting && !name.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!useExisting && !phone.trim()) {
      setError('Customer phone is required');
      return;
    }
    if (items.length === 0) {
      setError('Add at least one item');
      return;
    }
    if (items.some((i) => !i.itemName.trim())) {
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
      items: items.map((i) => ({
        itemName: i.itemName,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    });
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Create New Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Customer Toggle */}
          <div>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setUseExisting(false)}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  !useExisting
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-gray-600 border-gray-300'
                }`}
              >
                New Customer
              </button>
              <button
                onClick={() => setUseExisting(true)}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  useExisting
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-gray-600 border-gray-300'
                }`}
              >
                Existing Customer
              </button>
            </div>

            {useExisting ? (
              <input
                placeholder="Paste customer ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="space-y-2">
                <input
                  placeholder="Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  placeholder="Phone *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Items</span>
              <button
                onClick={addItem}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    placeholder="Item name"
                    value={item.itemName}
                    onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                    className="w-16 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                    className="w-24 border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-400 hover:text-red-600 text-lg font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Running Total */}
            <div className="text-right text-sm font-semibold text-gray-700 mt-2">
              Total: ₹{total.toFixed(2)}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
}