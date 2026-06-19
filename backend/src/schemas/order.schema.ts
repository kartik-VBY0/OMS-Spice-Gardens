import { z } from 'zod';

export const createOrderSchema = z.object({
  customer: z.object({
    id: z.string().uuid().nullable().optional(),
    name: z.string().min(1),
    email: z.string().email().nullable().optional(),
    phone: z.string().min(1),
  }),
  items: z.array(z.object({
    itemName: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
  })).min(1, 'Order must contain at least one item'),
});

export const addItemSchema = z.object({
  itemName: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
});