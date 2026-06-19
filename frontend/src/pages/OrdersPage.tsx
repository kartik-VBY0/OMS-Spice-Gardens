import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import type { OrderStatus } from '../types';
import OrderTable from '../components/OrderTable';
import SearchBar from '../components/SearchBar';
import StatusFilter from '../components/StatusFilter';
import Pagination from '../components/Pagination';
import CreateOrderModal from '../components/CreateOrderModal';

interface Props {
  onSelectOrder: (id: string) => void;
}

export default function OrdersPage({ onSelectOrder }: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, isError } = useOrders({ search, status, page, size: 10 });

  const orders = data?.data ?? [];
  const pagination = data?.meta?.pagination;

  // Reset to page 1 when filters change
  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatus(value: OrderStatus | '') {
    setStatus(value);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Spice Garden</h1>
            <p className="text-xs text-gray-400">Order Management System</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + New Order
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 mb-5">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search orders or customers..."
          />
          <StatusFilter value={status} onChange={handleStatus} />
          {(search || status) && (
            <button
              onClick={() => { handleSearch(''); handleStatus(''); }}
              className="text-sm text-gray-500 hover:text-gray-800 underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Stats Row */}
        {pagination && (
          <p className="text-sm text-gray-500 mb-3">
            {pagination.total} order{pagination.total !== 1 ? 's' : ''} found
          </p>
        )}

        {/* Table */}
        {isLoading && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Loading orders...
          </div>
        )}
        {isError && (
          <div className="text-center py-16 text-red-500 text-sm">
            Failed to load orders. Is the backend running?
          </div>
        )}
        {!isLoading && !isError && (
          <OrderTable orders={orders} onSelect={onSelectOrder} />
        )}

        {/* Pagination */}
        {pagination && (
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <CreateOrderModal onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}