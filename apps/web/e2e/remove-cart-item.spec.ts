import { test, expect } from '@playwright/test';

test('remove cart item from cart page', async ({ page }) => {
  await page.goto('/');

  const productCard = page.locator('article', { hasText: 'Настольная лампа «Орбита»' });
  await productCard.getByRole('button', { name: /в корзину/i }).click();
  await expect(productCard.getByTestId('quantity')).toHaveText('1');

  await page.goto('/cart');
  await expect(page.getByText('Настольная лампа «Орбита»')).toBeVisible();

  await page.getByRole('button', { name: 'Удалить' }).click();

  await expect(page.getByText('Корзина пуста')).toBeVisible();
  await expect(page.getByRole('link', { name: /перейти в каталог/i })).toBeVisible();
});
