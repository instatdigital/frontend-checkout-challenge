import { test, expect } from '@playwright/test';

test('catalog quantity controls: increment, stock limit, decrement to zero', async ({ page }) => {
  await page.goto('/');

  const productCard = page.locator('article', { hasText: 'Сумка «День»' });
  await expect(productCard).toBeVisible();

  await productCard.getByRole('button', { name: /в корзину/i }).click();
  await expect(productCard.getByTestId('quantity')).toHaveText('1');

  const incrementButton = productCard.getByRole('button', { name: 'Увеличить' });
  const decrementButton = productCard.getByRole('button', { name: 'Уменьшить' });

  for (let i = 0; i < 4; i += 1) {
    await incrementButton.click();
  }

  await expect(productCard.getByTestId('quantity')).toHaveText('5');
  await expect(incrementButton).toBeDisabled();

  for (let i = 0; i < 5; i += 1) {
    await decrementButton.click();
  }

  await expect(productCard.getByRole('button', { name: /в корзину/i })).toBeVisible();
  await expect(productCard.getByTestId('quantity')).not.toBeVisible();
});
