import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gsap } from 'gsap';
import { createOrder } from '../api/orders';
import { useCustomers } from '../hooks/useCustomers';
import type { Customer } from '../types';

interface Props {
  onBack: () => void;
  onCreated: () => void;
  onSelectExistingCustomer: (id: string) => void;
}

interface ItemRow {
  itemName: string;
  quantity: number;
  unitPrice: number;
}

function errorMessage(err: unknown) {
  return (
    (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
    'Failed to create order'
  );
}

function money(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CreateOrderPage({ onBack, onCreated, onSelectExistingCustomer }: Props) {
  const queryClient = useQueryClient();
  const pageRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ itemName: '', quantity: 1, unitPrice: 0 }]);
  const [error, setError] = useState('');

  const { data: customers = [], isLoading } = useCustomers();

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) => {
      return [customer.name, customer.phone, customer.email ?? '']
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [customers, search]);

  useEffect(() => {
    if (!pageRef.current) return;
    gsap.fromTo(
      pageRef.current.querySelectorAll('.create-card'),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power3.out' }
    );
  }, [mode]);

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onCreated();
    },
    onError: (err: unknown) => setError(errorMessage(err)),
  });

  const lineItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  function addLine() {
    setItems([...items, { itemName: '', quantity: 1, unitPrice: 0 }]);
  }

  function removeLine(index: number) {
    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateLine(index: number, field: keyof ItemRow, value: string | number) {
    setItems(items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  }

  function submitNewCustomerOrder() {
    setError('');
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!phone.trim()) {
      setError('Phone is required');
      return;
    }
    if (items.some((item) => !item.itemName.trim() || item.quantity < 1 || item.unitPrice < 0)) {
      setError('Add at least one valid item');
      return;
    }

    mutation.mutate({
      customer: {
        id: null,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
      },
      items: items.map((item) => ({
        itemName: item.itemName.trim(),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    });
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-[#faf8f3] px-4 py-6 text-stone-950 sm:px-5 md:px-12 md:py-8 lg:px-16">
      <button onClick={onBack} className="mb-6 text-sm font-semibold text-stone-500 hover:text-orange-700">
        &larr; Back to orders
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create order</h1>
        <p className="mt-2 text-stone-600">Add a customer and line items to place a new order.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-8">
        <div className="space-y-6 xl:space-y-8">
          <section className="create-card rounded-2xl border border-stone-200 bg-white p-4 shadow-xl shadow-stone-200/50 sm:rounded-3xl sm:p-6">
            <h2 className="mb-6 text-xl font-bold">Customer</h2>
            <div className="mb-6 grid w-full grid-cols-2 rounded-2xl border border-stone-200 bg-[#faf8f3] p-1 sm:inline-grid sm:w-auto">
              <button
                onClick={() => {
                  setMode('existing');
                  setError('');
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  mode === 'existing' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-600'
                }`}
              >
                Existing
              </button>
              <button
                onClick={() => {
                  setMode('new');
                  setError('');
                }}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  mode === 'new' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-600'
                }`}
              >
                New customer
              </button>
            </div>

            {mode === 'existing' ? (
              <div className="space-y-3">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customers by name, phone or email..."
                  className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm shadow-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100 sm:px-5 sm:py-4"
                />
                {isLoading && <div className="py-8 text-center text-sm text-stone-400">Loading customers...</div>}
                {!isLoading && filteredCustomers.length === 0 && (
                  <div className="rounded-2xl border border-stone-200 px-5 py-8 text-center text-sm text-stone-400">
                    No customers found.
                  </div>
                )}
                {filteredCustomers.map((customer: Customer) => (
                  <button
                    key={customer.id}
                    onClick={() => onSelectExistingCustomer(customer.id)}
                    className="w-full rounded-2xl border border-stone-200 px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 sm:px-5"
                  >
                    <div className="font-bold">{customer.name}</div>
                    <div className="mt-1 break-words text-sm text-stone-500">
                      {customer.phone}{customer.email ? ` · ${customer.email}` : ''}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold">Name *</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 shadow-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold">Phone *</span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+91 ..."
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 shadow-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold">Email (optional)</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@email.com"
                    className="w-full rounded-2xl border border-stone-200 px-4 py-3 shadow-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  />
                </label>
              </div>
            )}
          </section>

          {mode === 'new' && (
            <section className="create-card rounded-2xl border border-stone-200 bg-white p-4 shadow-xl shadow-stone-200/50 sm:rounded-3xl sm:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-bold">Items</h2>
                <button onClick={addLine} className="w-full rounded-2xl border border-stone-200 px-4 py-2 text-sm font-semibold transition-all hover:bg-orange-50 sm:w-auto">
                  + Add line
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid gap-3 sm:grid-cols-2 md:grid-cols-[1fr_140px_200px_110px_40px] md:items-center">
                    <input
                      value={item.itemName}
                      onChange={(event) => updateLine(index, 'itemName', event.target.value)}
                      placeholder="Dish name"
                      className="rounded-2xl border border-stone-200 px-4 py-3 shadow-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    />
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(event) => updateLine(index, 'quantity', Number(event.target.value))}
                      className="rounded-2xl border border-stone-200 px-4 py-3 shadow-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    />
                    <input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(event) => updateLine(index, 'unitPrice', Number(event.target.value))}
                      className="rounded-2xl border border-stone-200 px-4 py-3 shadow-sm outline-none transition-all focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                    />
                    <div className="font-bold sm:col-span-1">{money(item.quantity * item.unitPrice)}</div>
                    <button
                      onClick={() => removeLine(index)}
                      disabled={items.length === 1}
                      className="w-fit rounded-xl px-2 py-2 text-stone-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
              {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            </section>
          )}
        </div>

        <aside className="create-card h-fit rounded-2xl border border-stone-200 bg-white p-4 shadow-xl shadow-stone-200/50 sm:rounded-3xl sm:p-6 xl:sticky xl:top-8">
          <h2 className="mb-6 text-xl font-bold">Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-stone-200 pb-4 text-stone-600">
              <span>Line items</span>
              <span>{mode === 'new' ? lineItems : 0}</span>
            </div>
            <div className="flex justify-between text-xl font-bold">
              <span>Order total</span>
              <span>{mode === 'new' ? money(total) : money(0)}</span>
            </div>
            <button
              onClick={submitNewCustomerOrder}
              disabled={mode === 'existing' || mutation.isPending}
              className="w-full rounded-2xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mode === 'existing' ? 'Choose a customer first' : mutation.isPending ? 'Creating...' : '+ Create order'}
            </button>
            <p className="text-center text-sm text-stone-500">New orders start as Confirmed.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
