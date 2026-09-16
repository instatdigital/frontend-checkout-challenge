import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '@/entities/session';
import { removeCartItem, cartKeys } from '@/entities/cart';
import { ApiError } from '@/shared/api/errors';

type RemoveCartItemVars = { productId: string };

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    ({ productId }: RemoveCartItemVars, token) => removeCartItem(productId, token),
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
