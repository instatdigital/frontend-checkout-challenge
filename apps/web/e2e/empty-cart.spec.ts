import { test, expect } from '@playwright/test';

test('empty cart shows message and link to catalog', async ({ page }) => {
  await page.goto('/cart');

  await expect(page.getByText('Корзина пуста')).toBeVisible();

  const catalogLink = page.getByRole('link', { name: /перейти в каталог/i });
  await expect(catalogLink).toBeVisible();

  await catalogLink.click();
  await expect(page).toHaveURL('/');
});
