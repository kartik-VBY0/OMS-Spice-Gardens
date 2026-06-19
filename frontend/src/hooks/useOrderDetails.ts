import { useQuery } from '@tanstack/react-query';
import { fetchOrder } from '../api/orders';

export function useOrderDetails(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
}