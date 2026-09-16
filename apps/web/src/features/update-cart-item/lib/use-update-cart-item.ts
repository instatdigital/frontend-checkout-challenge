import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '@/entities/session';
import { setCartItem, cartKeys } from '@/entities/cart';
import type { ApiRequestBody } from '@/shared/api/api-types';

type UpdateCartItemVars = { productId: string; body: ApiRequestBody<'setCartItem'> };

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    ({ productId, body }: UpdateCartItemVars, token) => setCartItem(productId, body, token),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.detail() }) },
  );
}
