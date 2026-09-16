import { useQueryClient } from '@tanstack/react-query';
import { useAuthMutation } from '@/entities/session';
import { removeCartItem, cartKeys } from '@/entities/cart';

type RemoveCartItemVars = { productId: string };

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useAuthMutation(
    ({ productId }: RemoveCartItemVars, token) => removeCartItem(productId, token),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.detail() }) },
  );
}
