import { AppError } from './errors';

export function parsePagination(query: { page?: string; size?: string }) {
  const page = query.page ? parseInt(query.page, 10) : 1;
  const size = query.size ? parseInt(query.size, 10) : 10;
  if (isNaN(page) || page < 1) throw new AppError('INVALID_FILTER', 'page must be a positive integer', 400);
  if (isNaN(size) || size < 1) throw new AppError('INVALID_FILTER', 'size must be a positive integer', 400);
  return { page, size, offset: (page - 1) * size };
}