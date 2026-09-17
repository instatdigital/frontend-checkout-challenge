import { test, expect } from '@playwright/test';

test('catalog → cart → checkout → payment → success', async ({ page }) => {
  await page.goto('/');

  const productCard = page.locator('article', { hasText: 'Настольная лампа «Орбита»' });
  await expect(productCard).toBeVisible();

  await productCard.getByRole('button', { name: /в корзину/i }).click();
  await expect(productCard.getByTestId('quantity')).toHaveText('1');

  await productCard.getByRole('button', { name: /увеличить/i }).click();
  await expect(productCard.getByTestId('quantity')).toHaveText('2');

  await page.goto('/cart');

  await expect(page.getByText('Настольная лампа «Орбита»')).toBeVisible();
  await expect(page.locator('[class*="quantity"]')).toHaveText('2');

  await page.getByRole('link', { name: /оформить заказ/i }).click();

  await page.getByLabel('Имя').fill('Тестовый Покупатель');
  await page.getByLabel('Email').fill('buyer@example.test');
  await page.getByLabel('Телефон').fill('+79990000000');

  await page.getByLabel('Самовывоз').check();
  await page.getByLabel('Центральный пункт').check();

  await page.getByRole('button', { name: /рассчитать стоимость/i }).click();

  await page.getByRole('radio', { name: 'Карта', exact: true }).check();
  await page.getByRole('radio', { name: /успешная оплата/i }).check();

  await page.getByRole('button', { name: /оплатить картой/i }).click();

  await expect(page.getByText(/заказ оплачен|заказ оформлен/i)).toBeVisible();
});
