import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '../api/orders';
import type { ListOrdersParams } from '../api/orders';

export function useOrders(params: ListOrdersParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => fetchOrders(params),
  });
}