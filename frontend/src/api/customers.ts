import { apiClient } from './client';
import type { ApiResponse, Customer } from '../types';

export async function fetchCustomers(search?: string) {
  const res = await apiClient.get<ApiResponse<Customer[]>>('/customers', {
    params: search ? { search } : {},
  });
  return res.data.data;
}

export async function createCustomer(data: {
  name: string;
  email: string | null;
  phone: string;
}) {
  const res = await apiClient.post<ApiResponse<Customer>>('/customers', data);
  return res.data.data;
}