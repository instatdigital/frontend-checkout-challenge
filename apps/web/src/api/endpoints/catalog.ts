import { apiRequest } from '@/api/transport';
import type { Product } from '@checkout/contracts';

export function listProducts() {
  return apiRequest<Product[]>('GET', '/api/products');
}
