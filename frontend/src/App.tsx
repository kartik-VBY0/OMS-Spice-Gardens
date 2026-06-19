import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CreateOrderPage from './pages/CreateOrderPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

type View =
  | { name: 'orders' }
  | { name: 'customers' }
  | { name: 'createOrder' }
  | { name: 'orderDetail'; id: string }
  | { name: 'customerDetail'; id: string; openCreate?: boolean };

export default function App() {
  const [view, setView] = useState<View>({ name: 'orders' });
  const navigateDashboard = (name: 'orders' | 'customers') => {
    setView(name === 'orders' ? { name: 'orders' } : { name: 'customers' });
  };

  return (
    <QueryClientProvider client={queryClient}>
      {view.name === 'orders' && (
        <OrdersPage
          activeView="orders"
          onSelectOrder={(id) => setView({ name: 'orderDetail', id })}
          onSelectCustomer={(id) => setView({ name: 'customerDetail', id })}
          onCreateOrder={() => setView({ name: 'createOrder' })}
          onNavigate={navigateDashboard}
        />
      )}
      {view.name === 'customers' && (
        <OrdersPage
          activeView="customers"
          onSelectOrder={(id) => setView({ name: 'orderDetail', id })}
          onSelectCustomer={(id) => setView({ name: 'customerDetail', id })}
          onCreateOrder={() => setView({ name: 'createOrder' })}
          onNavigate={navigateDashboard}
        />
      )}
      {view.name === 'createOrder' && (
        <CreateOrderPage
          onBack={() => setView({ name: 'orders' })}
          onCreated={() => setView({ name: 'orders' })}
          onSelectExistingCustomer={(id) => setView({ name: 'customerDetail', id, openCreate: true })}
        />
      )}
      {view.name === 'orderDetail' && (
        <OrderDetailPage
          orderId={view.id}
          onBack={() => setView({ name: 'orders' })}
        />
      )}
      {view.name === 'customerDetail' && (
        <OrdersPage
          activeView="customerDetail"
          customerId={view.id}
          autoOpenCreate={view.openCreate}
          onSelectOrder={(id) => setView({ name: 'orderDetail', id })}
          onSelectCustomer={(id) => setView({ name: 'customerDetail', id })}
          onCreateOrder={() => setView({ name: 'createOrder' })}
          onNavigate={navigateDashboard}
        />
      )}
    </QueryClientProvider>
  );
}
