import { test, expect } from '@playwright/test';

// Basic sanity test for Playwright setup
test('homepage has superhero content', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/React/i);
  await expect(page.locator('body')).toContainText(/superheroes/i);
});

test('page loads within acceptable time', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  // Page should load within 3 seconds
  expect(loadTime).toBeLessThan(3000);
});

test('API endpoint responds successfully', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  
  // Wait for API call to complete
  const apiResponse = await page.waitForResponse(response => 
    response.url().includes('/api/superheroes') && response.status() === 200
  );
  
  expect(apiResponse.ok()).toBeTruthy();
});
