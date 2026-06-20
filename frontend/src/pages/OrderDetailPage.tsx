import { useOrderDetails } from '../hooks/useOrderDetails';
import OrderDetailPanel from '../components/OrderDetailPanel';

interface Props {
  orderId: string;
  onBack: () => void;
}

export default function OrderDetailPage({ orderId, onBack }: Props) {
  const { data: order, isLoading, isError } = useOrderDetails(orderId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f3] text-sm text-stone-400">
        Loading order...
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f3]">
        <div className="text-center">
          <p className="mb-3 text-sm text-red-500">Order not found.</p>
          <button onClick={onBack} className="text-sm font-semibold text-orange-700 hover:underline">
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f3] text-stone-950">
      <div className="border-b border-stone-200 bg-[#fffcf7] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="flex items-center gap-3">
  <img
    src="/image.png"
    alt="Spice Garden"
    className="h-10 w-10 rounded-2xl object-cover"
  />
  <div>
    <h1 className="text-lg font-bold">Spice Gardens</h1>
  </div>
</div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <OrderDetailPanel order={order} onBack={onBack} />
      </div>
    </div>
  );
}
