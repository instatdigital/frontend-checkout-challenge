import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '@/entities/session';
import { setCartItem, cartKeys } from '@/entities/cart';
import type { ApiRequestBody } from '@/shared/api/api-types';

type AddToCartVars = { productId: string; body: ApiRequestBody<'setCartItem'> };

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    ({ productId, body }: AddToCartVars, token) => setCartItem(productId, body, token),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.detail() }) },
  );
}
