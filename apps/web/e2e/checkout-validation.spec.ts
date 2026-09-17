import { test, expect } from '@playwright/test';

test('checkout form shows validation errors and blocks submit', async ({ page }) => {
  await page.goto('/checkout');

  await page.getByRole('button', { name: /рассчитать стоимость/i }).click();

  await expect(page.getByText('Имя обязательно')).toBeVisible();
  await expect(page.getByText('Email обязателен')).toBeVisible();
  await expect(page.getByText('Телефон обязателен')).toBeVisible();
  await expect(page).toHaveURL('/checkout');

  await page.getByLabel('Имя').fill('A');
  await page.getByLabel('Имя').blur();
  await expect(page.getByText('Минимум 2 символа')).toBeVisible();

  await page.getByLabel('Имя').fill('  ');
  await page.getByLabel('Имя').blur();
  await expect(page.getByText('Не может быть из пробелов')).toBeVisible();

  await page.getByLabel('Email').fill('not-an-email');
  await page.getByLabel('Email').blur();
  await expect(page.getByText('Некорректный email')).toBeVisible();

  await page.getByLabel('Телефон').fill('123');
  await page.getByLabel('Телефон').blur();
  await expect(page.getByText('Формат: +79990000000')).toBeVisible();

  await page.getByRole('button', { name: /рассчитать стоимость/i }).click();
  await expect(page).toHaveURL('/checkout');
});
