import { apiClient } from './client';
import type { ApiResponse, Customer } from '../types';

interface CustomerDto {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

function mapCustomer(customer: CustomerDto): Customer {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    createdAt: customer.createdAt ?? customer.created_at ?? '',
    updatedAt: customer.updatedAt ?? customer.updated_at ?? '',
  };
}

export async function fetchCustomers(search?: string) {
  const res = await apiClient.get<ApiResponse<CustomerDto[]>>('/customers', {
    params: search ? { search } : {},
  });
  return res.data.data.map(mapCustomer);
}

export async function createCustomer(data: {
  name: string;
  email: string | null;
  phone: string;
}) {
  const res = await apiClient.post<ApiResponse<CustomerDto>>('/customers', data);
  return mapCustomer(res.data.data);
}
