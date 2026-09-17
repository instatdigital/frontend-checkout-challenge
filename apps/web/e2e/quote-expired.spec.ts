import { test, expect } from '@playwright/test';

test('QUOTE_EXPIRED after cart changed in another tab', async ({ page }) => {
  await page.goto('/');

  const productCard = page.locator('article', { hasText: 'Настольная лампа «Орбита»' });
  await productCard.getByRole('button', { name: /в корзину/i }).click();
  await expect(productCard.getByTestId('quantity')).toHaveText('1');

  await page.goto('/cart');
  await page.getByRole('link', { name: /оформить заказ/i }).click();

  await page.getByLabel('Имя').fill('Тестовый Покупатель');
  await page.getByLabel('Email').fill('buyer@example.test');
  await page.getByLabel('Телефон').fill('+79990000000');
  await page.getByLabel('Самовывоз').check();
  await page.getByLabel('Центральный пункт').check();
  await page.getByRole('button', { name: /рассчитать стоимость/i }).click();

  await page.getByRole('radio', { name: 'Карта', exact: true }).check();
  await page.getByRole('radio', { name: /успешная оплата/i }).check();

  const token = await page.evaluate(() => localStorage.getItem('checkout_token'));
  if (!token) throw new Error('Session token not found');

  await page.evaluate(
    async ({ sessionToken }) => {
      // e2e-only direct API call to simulate cart change in another tab
      // eslint-disable-next-line no-restricted-syntax
      await fetch('http://localhost:4000/api/cart/items/mug-line', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ quantity: 1 }),
      });
    },
    { sessionToken: token },
  );

  await page.getByRole('button', { name: /оплатить картой/i }).click();

  await expect(page.getByText('Расчёт устарел')).toBeVisible();
  await page.getByRole('button', { name: /вернуться к чекауту/i }).click();
  await expect(page).toHaveURL('/checkout');
});
