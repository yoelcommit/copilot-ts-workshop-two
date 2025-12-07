import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('table is responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Verify table is still visible
    await expect(page.locator('table')).toBeVisible();

    // Check font size is reduced on mobile
    const table = page.locator('table');
    const fontSize = await table.evaluate(el =>
      window.getComputedStyle(el).fontSize
    );
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeLessThanOrEqual(14); // Mobile should have smaller font
  });

  test('comparison view adapts to mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Select two heroes
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    // Verify comparison container uses column layout on mobile
    const comparisonContainer = page.locator('.comparison-container');
    const flexDirection = await comparisonContainer.evaluate(el =>
      window.getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toBe('column');
  });

  test('hero images are smaller on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Navigate to comparison view
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const heroImage = page.locator('.hero-image').first();
    const width = await heroImage.evaluate(el =>
      window.getComputedStyle(el).width
    );
    const widthNum = parseInt(width);
    expect(widthNum).toBeLessThanOrEqual(120); // Mobile: 120px
  });

  test('stat rows adapt to single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Navigate to comparison
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    // Check stat row has single column grid on mobile
    const statRow = page.locator('.stat-row').first();
    const gridTemplateColumns = await statRow.evaluate(el =>
      window.getComputedStyle(el).gridTemplateColumns
    );

    // On mobile, the grid should have changed from 3 columns
    // The computed value will be in pixels, but we can check it's not the 3-column layout
    // Desktop would show something like "200px 400px 200px" (3 columns)
    // Mobile should show single value like "269px" (1 column)
    const columnCount = gridTemplateColumns.split(' ').length;
    expect(columnCount).toBeLessThanOrEqual(1);
  });

  test('tablet viewport maintains readable layout', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Verify table is visible and readable
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();

    // Select heroes and check comparison view
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    // Hero cards should be visible
    const heroCards = page.locator('.hero-card');
    await expect(heroCards).toHaveCount(2);
  });

  test('desktop viewport maintains original layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Verify table is visible
    await expect(page.locator('table')).toBeVisible();

    // Navigate to comparison view
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    // Comparison container should use row layout
    const comparisonContainer = page.locator('.comparison-container');
    const flexDirection = await comparisonContainer.evaluate(el =>
      window.getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toBe('row');
  });

  test('buttons remain accessible on all viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },  // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1280, height: 720 }  // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      await page.waitForSelector('tbody tr');

      // Compare button should be visible
      const compareButton = page.locator('button.compare-button');
      await expect(compareButton).toBeVisible();

      // Select heroes and check back button
      await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
      await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
      await page.locator('button.compare-button').click();

      const backButton = page.locator('button.back-button');
      await expect(backButton).toBeVisible();

      await backButton.click();
    }
  });

  test('mobile table cells have reduced padding', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const firstCell = page.locator('tbody td').first();
    const padding = await firstCell.evaluate(el =>
      window.getComputedStyle(el).padding
    );

    // Mobile should have 8px 4px padding
    expect(padding).toContain('8px');
    expect(padding).toContain('4px');
  });
});

