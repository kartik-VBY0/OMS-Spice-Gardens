import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().nullable().optional(),
  phone: z.string().min(1),
});

export const updateCustomerSchema = createCustomerSchema.partial();