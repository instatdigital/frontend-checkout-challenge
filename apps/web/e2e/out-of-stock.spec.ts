import { test, expect } from '@playwright/test';

test('out of stock product has disabled add to cart button', async ({ page }) => {
  await page.goto('/');

  const productCard = page.locator('article', { hasText: 'Часы «Точка»' });
  await expect(productCard).toBeVisible();

  const addButton = productCard.getByRole('button', { name: /в корзину/i });
  await expect(addButton).toBeDisabled();
  await expect(productCard.getByTestId('quantity')).not.toBeVisible();
});
