import { test, expect } from '@playwright/test';

test('cart total recalculates when quantity changes', async ({ page }) => {
  await page.goto('/');

  const productCard = page.locator('article', { hasText: 'Настольная лампа «Орбита»' });
  await productCard.getByRole('button', { name: /в корзину/i }).click();
  await expect(productCard.getByTestId('quantity')).toHaveText('1');

  await page.goto('/cart');
  await expect(page.getByText(/Итог/)).toBeVisible();
  await expect(page.getByText(/Итого:\s*2\s*490\s*₽/)).toBeVisible();

  await page.getByRole('button', { name: 'Увеличить' }).click();
  await expect(page.getByText(/Итого:\s*4\s*980\s*₽/)).toBeVisible();

  await page.getByRole('button', { name: 'Уменьшить' }).click();
  await expect(page.getByText(/Итого:\s*2\s*490\s*₽/)).toBeVisible();
});
