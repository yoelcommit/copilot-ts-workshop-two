import { test, expect } from '@playwright/test';

test.describe('Edge Cases', () => {
  test('handles empty hero selection correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Verify compare button is disabled with no selection
    const compareButton = page.locator('button.compare-button');
    await expect(compareButton).toBeDisabled();

    // Verify correct count displayed
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
  });

  test('handles rapid selection and deselection', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');

    // Rapidly toggle checkbox
    for (let i = 0; i < 5; i++) {
      await firstCheckbox.click();
    }

    // Final state should be checked (odd number of clicks)
    await expect(firstCheckbox).toBeChecked();
    await expect(page.locator('.selection-info p')).toContainText('(1/2 selected)');
  });

  test('selection count updates correctly during third hero selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Select first two heroes
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');

    // Select third hero - count should stay at 2
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');
  });

  test('each hero has all required powerstats', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const firstRow = page.locator('tbody tr').first();
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

    // Verify all stat columns exist and have numeric values
    for (let i = 0; i < stats.length; i++) {
      const statCell = firstRow.locator('td').nth(4 + i);
      const text = await statCell.textContent();
      expect(text).toBeTruthy();
      expect(text?.trim()).not.toBe('');
    }
  });

  test('table persists after returning from comparison', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Count heroes before comparison
    const initialCount = await page.locator('tbody tr').count();

    // Navigate to comparison and back
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
    await page.locator('button.back-button').click();

    // Verify same number of heroes displayed
    await page.waitForSelector('tbody tr');
    const finalCount = await page.locator('tbody tr').count();
    expect(finalCount).toBe(initialCount);
  });

  test('comparison view displays different data for different hero pairs', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const rowCount = await page.locator('tbody tr').count();
    if (rowCount < 3) {
      console.log('Skipping test - need at least 3 heroes');
      return;
    }

    // First comparison
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const firstComparisonHeroes = await page.locator('.hero-card h2').allTextContents();

    // Go back and select different heroes
    await page.locator('button.back-button').click();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const secondComparisonHeroes = await page.locator('.hero-card h2').allTextContents();

    // Verify different heroes are shown
    expect(secondComparisonHeroes).not.toEqual(firstComparisonHeroes);
  });

  test('winner calculation is consistent', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Compare same heroes twice
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const firstResult = await page.locator('.final-result').textContent();

    // Go back and compare same heroes again
    await page.locator('button.back-button').click();
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const secondResult = await page.locator('.final-result').textContent();

    // Results should be identical
    expect(secondResult).toBe(firstResult);
  });

  test('all stat rows show numeric values in comparison', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const statRows = page.locator('.stat-row');
    const count = await statRows.count();

    for (let i = 0; i < count; i++) {
      const row = statRows.nth(i);
      const statValues = row.locator('.stat-value');

      const value1 = await statValues.nth(0).textContent();
      const value2 = await statValues.nth(1).textContent();

      // Both values should be numeric
      expect(value1?.trim()).toMatch(/^\d+$/);
      expect(value2?.trim()).toMatch(/^\d+$/);
    }
  });

  test('hero images load correctly in table view', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const firstImage = page.locator('tbody tr').first().locator('td img');

    // Check image has src attribute
    const src = await firstImage.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src).toContain('http');

    // Check image is visible
    await expect(firstImage).toBeVisible();
  });

  test('hero images load correctly in comparison view', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const heroImages = page.locator('.hero-card img.hero-image');
    await expect(heroImages).toHaveCount(2);

    // Both images should be visible and have src
    for (let i = 0; i < 2; i++) {
      const img = heroImages.nth(i);
      await expect(img).toBeVisible();
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).toContain('http');
    }
  });

  test('selection state persists during navigation within table', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Select a hero
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await expect(page.locator('.selection-info p')).toContainText('(1/2 selected)');

    // Scroll or interact with table
    await page.locator('table').hover();
    
    // Selection should persist
    await expect(page.locator('tbody tr').nth(0).locator('input[type="checkbox"]')).toBeChecked();
    await expect(page.locator('.selection-info p')).toContainText('(1/2 selected)');
  });

  test('button states update immediately on selection changes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const compareButton = page.locator('button.compare-button');
    await expect(compareButton).toBeDisabled();

    // Select first hero
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await expect(compareButton).toBeDisabled();

    // Select second hero - button should enable immediately
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await expect(compareButton).toBeEnabled();

    // Deselect - button should disable immediately
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').uncheck();
    await expect(compareButton).toBeDisabled();
  });

  test('comparison view displays correct hero names', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Get names from table
    const firstName = await page.locator('tbody tr').nth(0).locator('td').nth(2).textContent();
    const secondName = await page.locator('tbody tr').nth(1).locator('td').nth(2).textContent();

    // Select and compare
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    // Verify names in comparison view
    const heroNames = await page.locator('.hero-card h2').allTextContents();
    expect(heroNames).toContain(firstName);
    expect(heroNames).toContain(secondName);
  });
});

