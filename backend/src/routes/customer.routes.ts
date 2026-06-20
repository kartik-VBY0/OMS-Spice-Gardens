import { Hono } from 'hono';
import { createCustomerSchema, updateCustomerSchema } from '../schemas/customer.schema.js';
import * as customerService from '../services/customer.service.js';
import { success } from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';

const router = new Hono();

router.get('/', async (c) => {
  const { page, size, offset } = parsePagination(c.req.query());
  const search = c.req.query('search');
  const { rows, total } = await customerService.listCustomers(search, page, size, offset);
  return c.json(success(rows, { page, size, total }));
});

router.post('/', async (c) => {
  const body = createCustomerSchema.parse(await c.req.json());
  const customer = await customerService.createCustomer(body);
  return c.json(success(customer), 201);
});

router.patch('/:id', async (c) => {
  const body = updateCustomerSchema.parse(await c.req.json());
  const customer = await customerService.updateCustomer(c.req.param('id'), body);
  return c.json(success(customer));
});

router.delete('/:id', async (c) => {
  await customerService.deleteCustomer(c.req.param('id'));
  return c.body(null, 204);
});

export default router;
