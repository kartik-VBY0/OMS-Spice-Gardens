import { pool } from '../db/pool.js';
import { AppError } from '../utils/errors.js';
import { generateOrderNumber } from '../utils/orderNumber.js';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

async function getFullOrder(orderId: string) {
  const orderRes = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
  if (orderRes.rows.length === 0) throw new AppError('RESOURCE_NOT_FOUND', 'Order not found', 404);
  const order = orderRes.rows[0];

  const customerRes = await pool.query('SELECT * FROM customers WHERE id = $1', [order.customer_id]);
  const itemsRes = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [orderId]);

  return mapOrder(order, customerRes.rows[0], itemsRes.rows);
}

function mapOrder(order: any, customer: any, items: any[]) {
  const mappedItems = items.map(i => ({
    id: i.id,
    itemName: i.item_name,
    quantity: i.quantity,
    unitPrice: Number(i.unit_price),
    totalPrice: Number(i.unit_price) * i.quantity,
  }));
  return {
    id: order.id,
    orderNumber: order.order_number,
    customerId: order.customer_id,
    status: order.status,
    totalAmount: mappedItems.reduce((sum, i) => sum + i.totalPrice, 0),
    itemCount: mappedItems.reduce((sum, i) => sum + i.quantity, 0),
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    customer: customer && {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
    },
    items: mappedItems,
  };
}

export async function listOrders(filters: {
  search?: string; status?: string; customerId?: string;
}, page: number, size: number, offset: number) {
  const conditions: string[] = [];
  const params: any[] = [];

  if (filters.status) {
    conditions.push(`o.status = $${params.length + 1}`);
    params.push(filters.status);
  }
  if (filters.customerId) {
    conditions.push(`o.customer_id = $${params.length + 1}`);
    params.push(filters.customerId);
  }
  if (filters.search) {
    conditions.push(`(o.order_number ILIKE $${params.length + 1} OR c.name ILIKE $${params.length + 1} OR c.phone ILIKE $${params.length + 1})`);
    params.push(`%${filters.search}%`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = await pool.query(
    `SELECT o.* FROM orders o JOIN customers c ON o.customer_id = c.id
     ${whereClause} ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, size, offset]
  );
  const count = await pool.query(
    `SELECT COUNT(*) FROM orders o JOIN customers c ON o.customer_id = c.id ${whereClause}`,
    params
  );

  const fullOrders = await Promise.all(rows.rows.map(o => getFullOrder(o.id)));
  return { rows: fullOrders, total: parseInt(count.rows[0].count, 10) };
}

export async function getOrder(orderId: string) {
  return getFullOrder(orderId);
}

export async function createOrder(body: any) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let customerId = body.customer.id;
    if (!customerId) {
      const newCustomer = await client.query(
        `INSERT INTO customers (name, email, phone) VALUES ($1,$2,$3) RETURNING id`,
        [body.customer.name, body.customer.email ?? null, body.customer.phone]
      );
      customerId = newCustomer.rows[0].id;
    } else {
      const existing = await client.query('SELECT id FROM customers WHERE id = $1', [customerId]);
      if (existing.rows.length === 0) throw new AppError('RESOURCE_NOT_FOUND', 'Customer not found', 404);
    }

    const orderNumber = generateOrderNumber();
    const orderRes = await client.query(
      `INSERT INTO orders (order_number, customer_id) VALUES ($1,$2) RETURNING id`,
      [orderNumber, customerId]
    );
    const orderId = orderRes.rows[0].id;

    for (const item of body.items) {
      await client.query(
        `INSERT INTO order_items (order_id, item_name, quantity, unit_price) VALUES ($1,$2,$3,$4)`,
        [orderId, item.itemName, item.quantity, item.unitPrice]
      );
    }

    await client.query('COMMIT');
    return getFullOrder(orderId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const current = await pool.query('SELECT status FROM orders WHERE id = $1', [orderId]);
  if (current.rows.length === 0) throw new AppError('RESOURCE_NOT_FOUND', 'Order not found', 404);

  const currentStatus = current.rows[0].status;
 const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
if (!allowed.includes(newStatus)) {
  throw new AppError('INVALID_STATUS_TRANSITION', `Cannot move from ${currentStatus} to ${newStatus}`, 409);
}

  await pool.query('UPDATE orders SET status = $1, updated_at = now() WHERE id = $2', [newStatus, orderId]);
  return getFullOrder(orderId);
}

export async function addOrderItem(orderId: string, item: { itemName: string; quantity: number; unitPrice: number }) {
  const order = await pool.query('SELECT id FROM orders WHERE id = $1', [orderId]);
  if (order.rows.length === 0) throw new AppError('RESOURCE_NOT_FOUND', 'Order not found', 404);

  await pool.query(
    `INSERT INTO order_items (order_id, item_name, quantity, unit_price) VALUES ($1,$2,$3,$4)`,
    [orderId, item.itemName, item.quantity, item.unitPrice]
  );
  return getFullOrder(orderId);
}

export async function deleteOrderItem(orderId: string, itemId: string) {
  const order = await pool.query('SELECT id FROM orders WHERE id = $1', [orderId]);
  if (order.rows.length === 0) throw new AppError('RESOURCE_NOT_FOUND', 'Order not found', 404);

  const result = await pool.query('DELETE FROM order_items WHERE id = $1 AND order_id = $2 RETURNING id', [itemId, orderId]);
  if (result.rows.length === 0) throw new AppError('RESOURCE_NOT_FOUND', 'Order item not found', 404);

  return getFullOrder(orderId);
}
