import { pool } from '../db/pool.js';
import { AppError } from '../utils/errors.js';


export async function listCustomers(search: string | undefined, page: number, size: number, offset: number) {
  const searchClause = search ? `WHERE name ILIKE $1 OR phone ILIKE $1` : '';
  const params = search ? [`%${search}%`] : [];

  const rows = await pool.query(
    `SELECT * FROM customers ${searchClause} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, size, offset]
  );
  const count = await pool.query(`SELECT COUNT(*) FROM customers ${searchClause}`, params);

  return { rows: rows.rows, total: parseInt(count.rows[0].count, 10) };
}

export async function createCustomer(data: { name: string; email?: string | null; phone: string }) {
  const result = await pool.query(
    `INSERT INTO customers (name, email, phone) VALUES ($1,$2,$3) RETURNING *`,
    [data.name, data.email ?? null, data.phone]
  );
  return result.rows[0];
}

export async function updateCustomer(id: string, data: Partial<{ name: string; email: string | null; phone: string }>) {
  const existing = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
  if (existing.rows.length === 0) throw new AppError('RESOURCE_NOT_FOUND', 'Customer not found', 404);

  const fields = Object.keys(data);
  if (fields.length === 0) return existing.rows[0];

  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
  const result = await pool.query(
    `UPDATE customers SET ${setClause}, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, ...Object.values(data)]
  );
  return result.rows[0];
}

export async function deleteCustomer(id: string) {
  const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) throw new AppError('RESOURCE_NOT_FOUND', 'Customer not found', 404);
}
