import { Hono } from 'hono';
import { createOrderSchema, addItemSchema, updateStatusSchema } from '../schemas/order.schema.js';
import * as orderService from '../services/order.service.js';
import { success } from '../utils/response.js';
import { parsePagination } from '../utils/pagination.js';
import { AppError } from '../utils/errors.js';

const router = new Hono();
const VALID_STATUSES = ['CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

router.get('/', async (c) => {
  const { page, size, offset } = parsePagination(c.req.query());
  const status = c.req.query('status');
  if (status && !VALID_STATUSES.includes(status)) {
    throw new AppError('INVALID_FILTER', 'Invalid status filter', 400);
  }
  const { rows, total } = await orderService.listOrders(
    { search: c.req.query('search'), status, customerId: c.req.query('customerId') },
    page, size, offset
  );
  return c.json(success(rows, { page, size, total }));
});

router.get('/:id', async (c) => {
  const order = await orderService.getOrder(c.req.param('id'));
  return c.json(success(order));
});

router.post('/', async (c) => {
  const body = createOrderSchema.parse(await c.req.json());
  const order = await orderService.createOrder(body);
  return c.json(success(order), 201);
});

router.patch('/:id/status', async (c) => {
  const body = updateStatusSchema.parse(await c.req.json());
  const order = await orderService.updateOrderStatus(c.req.param('id'), body.status);
  return c.json(success(order));
});

router.post('/:id/items', async (c) => {
  const body = addItemSchema.parse(await c.req.json());
  const order = await orderService.addOrderItem(c.req.param('id'), body);
  return c.json(success(order), 201);
});

router.delete('/:id/items/:itemId', async (c) => {
  const order = await orderService.deleteOrderItem(c.req.param('id'), c.req.param('itemId'));
  return c.json(success(order));
});

export default router;
