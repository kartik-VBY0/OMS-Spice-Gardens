import { useQuery } from '@tanstack/react-query';
import { fetchCustomers } from '../api/customers';

export function useCustomers(search?: string) {
  return useQuery({
    queryKey: ['customers', search],
    queryFn: () => fetchCustomers(search),
  });
}