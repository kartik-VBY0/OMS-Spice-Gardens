export function success<T>(data: T, pagination?: {
  page: number; size: number; total: number;
}) {
  return {
    data,
    ...(pagination
      ? { meta: { pagination: { ...pagination, totalPages: Math.ceil(pagination.total / pagination.size) } } }
      : {}),
  };
}