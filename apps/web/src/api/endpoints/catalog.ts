import { apiRequest } from '@/api/transport';
import type { ApiResponseData } from '@/api/api-types';

export function listProducts() {
  return apiRequest<ApiResponseData<'listProducts', 200>>('GET', '/api/products');
}
