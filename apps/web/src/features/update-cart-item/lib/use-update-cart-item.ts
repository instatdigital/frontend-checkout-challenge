import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '@/entities/session';
import { setCartItem, cartKeys } from '@/entities/cart';
import { ApiError } from '@/shared/api/errors';
import type { ApiRequestBody } from '@/shared/api/api-types';

type UpdateCartItemVars = { productId: string; body: ApiRequestBody<'setCartItem'> };

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    ({ productId, body }: UpdateCartItemVars, token) => setCartItem(productId, body, token),
    {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.detail() }),
      onError: (error) => {
        if (error instanceof ApiError && error.status === 409) {
          void queryClient.invalidateQueries({ queryKey: cartKeys.detail() });
        }
      },
    },
  );
}
