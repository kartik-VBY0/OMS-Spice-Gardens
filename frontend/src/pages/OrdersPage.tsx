import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useOrders } from '../hooks/useOrders';
import { useCustomers } from '../hooks/useCustomers';
import type { Customer, OrderDetails, OrderStatus } from '../types';
import OrderTable from '../components/OrderTable';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import CreateOrderModal from '../components/CreateOrderModal';

type DashboardView = 'orders' | 'customers' | 'customerDetail';

interface Props {
  activeView: DashboardView;
  customerId?: string;
  autoOpenCreate?: boolean;
  onSelectOrder: (id: string) => void;
  onSelectCustomer: (id: string) => void;
  onCreateOrder: () => void;
  onNavigate: (name: 'orders' | 'customers') => void;
}

const STATUSES: Array<OrderStatus | ''> = ['', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

function titleCaseStatus(status: OrderStatus | '') {
  if (!status) return 'All';
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function Sidebar({ activeView, onNavigate }: Pick<Props, 'activeView' | 'onNavigate'>) {
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!navRef.current) return;
    gsap.fromTo(
      navRef.current.querySelectorAll('.side-item'),
      { x: -18, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: 'power3.out' }
    );
  }, []);

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-72 flex-col border-r border-stone-200 bg-[#fffcf7] px-5 py-9">
      <div className="flex items-center gap-3">
        <img
  src="/image.png"
  alt="Spice Gardens Logo"
  className="h-12 w-12 rounded-2xl object-cover shadow-lg"
/>
        <div>
          <h1 className="text-lg font-bold text-stone-950">Spice Gardens</h1>
          
        </div>
      </div>

      <nav ref={navRef} className="mt-9 space-y-2">
        <button
          onClick={() => onNavigate('orders')}
          className={`side-item flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all hover:translate-x-1 ${
            activeView === 'orders'
              ? 'bg-orange-100 text-orange-800'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <span>☷</span>
          Orders
        </button>
        <button
          onClick={() => onNavigate('customers')}
          className={`side-item flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all hover:translate-x-1 ${
            activeView !== 'orders'
              ? 'bg-orange-100 text-orange-800'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <span>◎</span>
          Customers
        </button>
      </nav>

      
    </aside>
  );
}

function MobileNav({ activeView, onNavigate }: Pick<Props, 'activeView' | 'onNavigate'>) {
  return (
    <div className="sticky top-0 z-30 border-b border-stone-200 bg-[#fffcf7]/95 px-4 py-3 backdrop-blur md:hidden">
      <div className="mb-3 flex items-center gap-3">
        <img
          src="/image.png"
          alt="Spice Gardens Logo"
          className="h-10 w-10 rounded-xl object-cover shadow-md"
        />
        <h1 className="text-base font-bold text-stone-950">Spice Gardens</h1>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onNavigate('orders')}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
            activeView === 'orders'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-stone-700 ring-1 ring-stone-200'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => onNavigate('customers')}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
            activeView !== 'orders'
              ? 'bg-orange-600 text-white'
              : 'bg-white text-stone-700 ring-1 ring-stone-200'
          }`}
        >
          Customers
        </button>
      </div>
    </div>
  );
}

export default function OrdersPage({
  activeView,
  customerId,
  autoOpenCreate,
  onSelectOrder,
  onSelectCustomer,
  onCreateOrder,
  onNavigate,
}: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useOrders({
    search,
    status,
    customerId: activeView === 'customerDetail' ? customerId : undefined,
    page,
    size: 10,
  });
  const { data: customers = [], isLoading: customersLoading } = useCustomers(customerSearch);

  const orders = data?.data ?? [];
  const pagination = data?.meta?.pagination;
  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === customerId),
    [customers, customerId]
  );
  const activeCustomer = selectedCustomer ?? orders[0]?.customer;

  useEffect(() => {
    setPage(1);
  }, [activeView, customerId]);

  useEffect(() => {
    if (autoOpenCreate && activeView === 'customerDetail' && activeCustomer) {
      setShowModal(true);
    }
  }, [autoOpenCreate, activeView, activeCustomer]);

  useEffect(() => {
    if (!contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, x: 28 },
      { opacity: 1, x: 0, duration: 0.42, ease: 'power3.out' }
    );
  }, [activeView, customerId]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatus(value: OrderStatus | '') {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-stone-950">
      <Sidebar activeView={activeView} onNavigate={onNavigate} />
      <MobileNav activeView={activeView} onNavigate={onNavigate} />

      <main ref={contentRef} className="min-h-screen px-4 py-6 sm:px-5 md:ml-72 md:px-12 md:py-8 lg:px-16">
        {activeView === 'orders' && (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Orders</h2>
                <p className="mt-2 text-stone-600">Track and manage every order across the kitchen.</p>
              </div>
              <button
                onClick={onCreateOrder}
                className="w-full rounded-2xl bg-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:-translate-y-0.5 hover:bg-orange-700 active:translate-y-0 sm:w-fit"
              >
                + Create Order
              </button>
            </div>

            <div className="mb-5 max-w-xl">
              <SearchBar
                value={search}
                onChange={handleSearch}
                placeholder="Search by order number or customer..."
              />
            </div>

            <div className="mb-6 flex gap-3 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible">
              {STATUSES.map((item) => (
                <button
                  key={item || 'all'}
                  onClick={() => handleStatus(item)}
                  className={`shrink-0 rounded-full border px-5 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                    status === item
                      ? 'border-orange-600 bg-orange-600 text-white shadow-md shadow-orange-600/20'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-orange-200 hover:text-orange-700'
                  }`}
                >
                  {titleCaseStatus(item)}
                </button>
              ))}
            </div>

            {isLoading && <div className="py-16 text-center text-sm text-stone-400">Loading orders...</div>}
            {isError && <div className="py-16 text-center text-sm text-red-500">Failed to load orders. Is the backend running?</div>}
            {!isLoading && !isError && (
              <OrderTable orders={orders} onSelect={onSelectOrder} onSelectCustomer={onSelectCustomer} />
            )}
            {pagination && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />}
          </>
        )}

        {activeView === 'customers' && (
          <CustomersView
            customers={customers}
            isLoading={customersLoading}
            search={customerSearch}
            onSearch={setCustomerSearch}
            onSelectCustomer={onSelectCustomer}
          />
        )}

        {activeView === 'customerDetail' && (
          <CustomerDetailView
            customer={activeCustomer}
            orders={orders}
            onBack={() => onNavigate('customers')}
            onSelectOrder={onSelectOrder}
            onCreateOrder={() => setShowModal(true)}
          />
        )}
      </main>

      {showModal && (
        <CreateOrderModal
          onClose={() => setShowModal(false)}
          presetCustomer={activeView === 'customerDetail' ? activeCustomer : undefined}
        />
      )}
    </div>
  );
}

function CustomersView({
  customers,
  isLoading,
  search,
  onSearch,
  onSelectCustomer,
}: {
  customers: Customer[];
  isLoading: boolean;
  search: string;
  onSearch: (value: string) => void;
  onSelectCustomer: (id: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    gsap.fromTo(
      listRef.current.querySelectorAll('.customer-row'),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power3.out' }
    );
  }, [customers]);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Customers</h2>
        <p className="mt-2 text-stone-600">Search a customer, view their current orders, and create another order.</p>
      </div>
      <div className="mb-6 max-w-xl">
        <SearchBar value={search} onChange={onSearch} placeholder="Search customers by name or phone..." />
      </div>
      <div ref={listRef} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-200/50 sm:rounded-3xl">
        {isLoading && <div className="py-16 text-center text-sm text-stone-400">Loading customers...</div>}
        {!isLoading && customers.length === 0 && <div className="py-16 text-center text-sm text-stone-400">No customers found.</div>}
        {customers.map((customer) => (
          <button
            key={customer.id}
            onClick={() => onSelectCustomer(customer.id)}
            className="customer-row flex w-full flex-col gap-2 border-b border-stone-100 px-4 py-4 text-left transition-all last:border-b-0 hover:bg-orange-50 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
          >
            <div>
              <div className="text-lg font-bold">{customer.name}</div>
              <div className="text-sm text-stone-500">{customer.phone}</div>
            </div>
            <div className="text-sm text-stone-500">{customer.email ?? 'No email'}</div>
          </button>
        ))}
      </div>
    </>
  );
}

function CustomerDetailView({
  customer,
  orders,
  onBack,
  onSelectOrder,
  onCreateOrder,
}: {
  customer?: Customer;
  orders: OrderDetails[];
  onBack: () => void;
  onSelectOrder: (id: string) => void;
  onCreateOrder: () => void;
}) {
  if (!customer) {
    return (
      <div>
        <button onClick={onBack} className="mb-6 text-sm font-semibold text-stone-500 hover:text-orange-700">
          ← All customers
        </button>
        <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-400 sm:rounded-3xl sm:p-10">
          Customer not found.
        </div>
      </div>
    );
  }

  return (
    <>
      <button onClick={onBack} className="mb-6 text-sm font-semibold text-stone-500 hover:text-orange-700">
        ← All customers
      </button>
      <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-xl shadow-stone-200/50 sm:rounded-3xl sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{customer.name}</h2>
            <div className="mt-5 flex flex-col gap-3 break-words text-stone-600 sm:flex-row sm:flex-wrap sm:gap-6">
              <span>☎ {customer.phone}</span>
              <span>✉ {customer.email ?? 'No email'}</span>
              <span>Joined {new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          <button
            onClick={onCreateOrder}
            className="w-full rounded-2xl bg-orange-600 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:-translate-y-0.5 hover:bg-orange-700 sm:w-auto"
          >
            + New Order
          </button>
        </div>
      </section>

      <div className="mb-4 text-sm font-bold uppercase tracking-wide text-stone-600">
        Orders ({orders.length})
      </div>
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-200/50 sm:rounded-3xl">
        {orders.length === 0 && <div className="py-14 text-center text-sm text-stone-400">No orders for this customer yet.</div>}
        {orders.map((order) => (
          <button
            key={order.id}
            onClick={() => onSelectOrder(order.id)}
            className="grid w-full gap-2 border-b border-stone-100 px-4 py-4 text-left transition-all last:border-b-0 hover:bg-orange-50 sm:gap-4 sm:px-6 sm:py-5 md:grid-cols-[1.3fr_1fr_1fr_1fr_1fr]"
          >
            <span className="font-bold text-orange-700">{order.orderNumber}</span>
            <span className="text-stone-600">{titleCaseStatus(order.status)}</span>
            <span className="text-stone-600">{order.itemCount} items</span>
            <span className="font-bold">{formatMoney(order.totalAmount)}</span>
            <span className="text-stone-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </button>
        ))}
      </div>
    </>
  );
}
