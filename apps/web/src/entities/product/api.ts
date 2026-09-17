import { apiRequest } from '@/shared/api/transport';
import type { ApiResponseData } from '@/shared/api/api-types';

export const productKeys = {
  list: () => ['products'] as const,
};

export function listProducts() {
  return apiRequest<ApiResponseData<'listProducts', 200>>('GET', '/api/products');
}
