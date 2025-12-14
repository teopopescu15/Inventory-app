import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
  test('Login page should load and have all elements', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:5173/login');

    // Check page title
    await expect(page.locator('h1')).toHaveText('Welcome Back');

    // Check if all form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();

    // Check social login buttons
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
    await expect(page.locator('button:has-text("GitHub")')).toBeVisible();

    // Check links
    await expect(page.locator('a:has-text("Forgot password?")')).toBeVisible();
    await expect(page.locator('a:has-text("Sign up")')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/login-page.png', fullPage: true });
  });

  test('Sign up page should load and have all elements', async ({ page }) => {
    // Navigate to signup page
    await page.goto('http://localhost:5173/signup');

    // Check page title
    await expect(page.locator('h1')).toHaveText('Create Account');

    // Check if all form elements are present
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create Account")')).toBeVisible();

    // Check terms checkbox
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();

    // Check link to login
    await expect(page.locator('a:has-text("Sign in")')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/signup-page.png', fullPage: true });
  });

  test('Password strength indicator works', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');

    const passwordInput = page.locator('input[name="password"]');

    // Test weak password
    await passwordInput.fill('abc');
    await expect(page.locator('text=Weak')).toBeVisible();

    // Test stronger password
    await passwordInput.fill('Abc123!@#');
    await expect(page.locator('text=Strong')).toBeVisible();
  });

  test('Password match validation works', async ({ page }) => {
    await page.goto('http://localhost:5173/signup');

    const passwordInput = page.locator('input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');

    // Test matching passwords
    await passwordInput.fill('Test123!');
    await confirmPasswordInput.fill('Test123!');
    await expect(page.locator('text=Passwords match')).toBeVisible();

    // Test non-matching passwords
    await confirmPasswordInput.fill('Different123!');
    await expect(page.locator("text=Passwords don't match")).toBeVisible();
  });

  test('Show/hide password toggle works', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    const passwordInput = page.locator('input[type="password"]').first();
    const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1);

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle to show password
    await toggleButton.click();
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });

  test('Responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('http://localhost:5173/login');

    // Check if page is still functional on mobile
    await expect(page.locator('h1')).toHaveText('Welcome Back');
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({ path: 'tests/screenshots/login-mobile.png', fullPage: true });
  });
});