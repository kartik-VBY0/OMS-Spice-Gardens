import { apiClient } from './client';
import type { ApiResponse, OrderDetails, OrderStatus } from '../types';

export interface ListOrdersParams {
  search?: string;
  status?: OrderStatus | '';
  customerId?: string;
  page?: number;
  size?: number;
}

export async function fetchOrders(params: ListOrdersParams) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
  );
  const res = await apiClient.get<ApiResponse<OrderDetails[]>>('/orders', {
    params: cleanParams,
  });
  return res.data;
}

export async function fetchOrder(id: string) {
  const res = await apiClient.get<ApiResponse<OrderDetails>>(`/orders/${id}`);
  return res.data.data;
}

export async function createOrder(payload: {
  customer: {
    id: string | null;
    name: string;
    email: string | null;
    phone: string;
  };
  items: {
    itemName: string;
    quantity: number;
    unitPrice: number;
  }[];
}) {
  const res = await apiClient.post<ApiResponse<OrderDetails>>('/orders', payload);
  return res.data.data;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const res = await apiClient.patch<ApiResponse<OrderDetails>>(
    `/orders/${id}/status`,
    { status }
  );
  return res.data.data;
}

export async function addOrderItem(
  orderId: string,
  item: { itemName: string; quantity: number; unitPrice: number }
) {
  const res = await apiClient.post<ApiResponse<OrderDetails>>(
    `/orders/${orderId}/items`,
    item
  );
  return res.data.data;
}

export async function deleteOrderItem(orderId: string, itemId: string) {
  const res = await apiClient.delete<ApiResponse<OrderDetails>>(
    `/orders/${orderId}/items/${itemId}`
  );
  return res.data.data;
}