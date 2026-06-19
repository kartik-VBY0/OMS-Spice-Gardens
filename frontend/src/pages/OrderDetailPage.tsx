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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400 text-sm">
        Loading order...
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-sm mb-3">Order not found.</p>
          <button
            onClick={onBack}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">Spice Garden</h1>
          <p className="text-xs text-gray-400">Order Management System</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <OrderDetailPanel order={order} onBack={onBack} />
      </div>
    </div>
  );
}