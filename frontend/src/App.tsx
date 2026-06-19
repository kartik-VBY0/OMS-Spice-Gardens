import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';

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
  | { name: 'orderDetail'; id: string };

export default function App() {
  const [view, setView] = useState<View>({ name: 'orders' });

  return (
    <QueryClientProvider client={queryClient}>
      {view.name === 'orders' && (
        <OrdersPage
          onSelectOrder={(id) => setView({ name: 'orderDetail', id })}
        />
      )}
      {view.name === 'orderDetail' && (
        <OrderDetailPage
          orderId={view.id}
          onBack={() => setView({ name: 'orders' })}
        />
      )}
    </QueryClientProvider>
  );
}