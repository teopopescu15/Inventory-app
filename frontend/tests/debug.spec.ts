import { test, expect } from '@playwright/test';

test('Debug: Check what is on the login page', async ({ page }) => {
  await page.goto('http://localhost:5173/login');

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Take a screenshot
  await page.screenshot({ path: 'tests/debug-login.png', fullPage: true });

  // Log the page content
  const title = await page.title();
  console.log('Page title:', title);

  const h1Elements = await page.locator('h1').count();
  console.log('Number of h1 elements:', h1Elements);

  if (h1Elements > 0) {
    const h1Text = await page.locator('h1').first().textContent();
    console.log('H1 text:', h1Text);
  }

  // Log all text content
  const bodyText = await page.locator('body').textContent();
  console.log('Body text (first 500 chars):', bodyText?.substring(0, 500));
});