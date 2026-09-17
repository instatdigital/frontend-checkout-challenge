import { test, expect } from '@playwright/test';

test('declined card → retry with success card', async ({ page }) => {
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
  await page.getByRole('radio', { name: /отказ банка/i }).check();
  await page.getByRole('button', { name: /оплатить картой/i }).click();

  await expect(page.getByText('Оплата не прошла')).toBeVisible();

  await page.getByRole('radio', { name: /успешная оплата/i }).check();
  await page.getByRole('button', { name: /оплатить картой/i }).click();

  await expect(page.getByText(/заказ оплачен|заказ оформлен/i)).toBeVisible();
});
