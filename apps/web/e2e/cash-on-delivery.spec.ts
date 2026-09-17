import { test, expect } from '@playwright/test';

test('cash on delivery: order without online payment', async ({ page }) => {
  await page.goto('/');

  const productCard = page.locator('article', { hasText: 'Настольная лампа «Орбита»' });
  await expect(productCard).toBeVisible();

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

  await page.getByRole('radio', { name: /наличные при получении/i }).check();
  await page.getByRole('button', { name: /оформить заказ/i }).click();

  await expect(page.getByText('Заказ оформлен, оплата при получении')).toBeVisible();
});
