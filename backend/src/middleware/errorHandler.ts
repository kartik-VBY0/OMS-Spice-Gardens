import type { Context } from 'hono';
import { AppError } from '../utils/errors.js';

export function handleError(err: unknown, c: Context) {
  console.error('ERROR CAUGHT:', err); // remove this after everything works

  if (err instanceof AppError) {
    return c.json({ error: { code: err.code, message: err.message } }, err.status as any);
  }

  // Check Zod error by shape instead of instanceof (avoids double-copy issues)
  if ((err as any)?.name === 'ZodError' && Array.isArray((err as any)?.errors)) {
    const messages = (err as any).errors
      .map((e: any) => String(e.message))
      .join(', ');
    return c.json({ error: { code: 'VALIDATION_FAILED', message: messages } }, 400);
  }

  // Postgres unique violation
  if ((err as any)?.code === '23505') {
    return c.json({ error: { code: 'RESOURCE_ALREADY_EXISTS', message: 'Resource already exists' } }, 409);
  }

  // Postgres invalid UUID syntax
  if ((err as any)?.code === '22P02') {
    return c.json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'Resource not found' } }, 404);
  }

  console.error('UNHANDLED:', err);
  return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }, 500);
}
