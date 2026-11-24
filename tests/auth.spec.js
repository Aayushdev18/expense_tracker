import { test, expect } from '@playwright/test';

const testEmail = `auth_${Date.now()}@example.com`;
const testPassword = 'password123';

test.describe.serial('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('can register a new account', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: "Don't have an account? Sign Up" }).click();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();

    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill(testPassword);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByRole('heading', { name: 'Spendly' })).toBeVisible();
  });

  test('shows error for duplicate email', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: "Don't have an account? Sign Up" }).click();

    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill(testPassword);
    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText('Email already in use')).toBeVisible();
  });

  test('can login with existing account', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill(testPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByRole('heading', { name: 'Spendly' })).toBeVisible();
  });

  test('shows error for wrong password', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('can logout', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password', { exact: true }).fill(testPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByRole('heading', { name: 'Spendly' })).toBeVisible();

    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page.getByLabel('Email')).toBeVisible();
  });
});
