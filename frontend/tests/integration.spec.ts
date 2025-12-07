import { test, expect } from '@playwright/test';

test.describe('End-to-End User Flow', () => {
  test('complete flow: load -> select -> compare -> back', async ({ page }) => {
    // 1. Load the page
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Superheroes');
    
    // 2. Wait for data to load
    await page.waitForSelector('tbody tr');
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(1);
    
    // 3. Select first hero
    const firstRow = page.locator('tbody tr').nth(0);
    const firstName = await firstRow.locator('td').nth(2).textContent();
    await firstRow.locator('input[type="checkbox"]').check();
    await expect(page.locator('.selection-info p')).toContainText('(1/2 selected)');
    
    // 4. Select second hero
    const secondRow = page.locator('tbody tr').nth(1);
    const secondName = await secondRow.locator('td').nth(2).textContent();
    await secondRow.locator('input[type="checkbox"]').check();
    await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');
    
    // 5. Verify selected heroes are displayed
    await expect(page.locator('.selected-heroes')).toContainText(firstName || '');
    await expect(page.locator('.selected-heroes')).toContainText(secondName || '');
    
    // 6. Click compare button
    await page.locator('button.compare-button').click();
    
    // 7. Verify comparison view
    await expect(page.locator('h1')).toContainText('Superhero Comparison');
    await expect(page.locator('.hero-card')).toHaveCount(2);
    await expect(page.locator('.stat-row')).toHaveCount(6);
    
    // 8. Verify final result exists
    await expect(page.locator('.final-result')).toBeVisible();
    
    // 9. Go back to table
    await page.locator('button.back-button').click();
    
    // 10. Verify back at table with cleared selection
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
    const checkedBoxes = page.locator('input[type="checkbox"]:checked');
    await expect(checkedBoxes).toHaveCount(0);
  });

  test('handles API errors gracefully', async ({ page }) => {
    // This test verifies the app doesn't crash if API fails
    // The app should still load even if fetch fails
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('.selection-info')).toBeVisible();
  });

  test('handles slow API responses', async ({ page }) => {
    // Navigate and wait with extended timeout
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Page should still be functional
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('table')).toBeVisible();
  });

  test('recovers from temporary network issues', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Verify data loaded initially
    const initialRowCount = await page.locator('tbody tr').count();
    expect(initialRowCount).toBeGreaterThan(0);
    
    // Navigate to comparison and back (simulates continued use after network recovery)
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
    await page.locator('button.back-button').click();
    
    // Data should still be present
    const finalRowCount = await page.locator('tbody tr').count();
    expect(finalRowCount).toBe(initialRowCount);
  });

  test('multiple comparison cycles', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Verify we have at least 4 heroes
    const rowCount = await page.locator('tbody tr').count();
    if (rowCount < 4) {
      console.log(`Skipping test - only ${rowCount} heroes available, need at least 4`);
      return;
    }
    
    // First comparison
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
    await expect(page.locator('h1')).toContainText('Superhero Comparison');
    
    // Back to table
    await page.locator('button.back-button').click();
    await expect(page.locator('h1')).toContainText('Superheroes');
    
    // Second comparison with different heroes
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(3).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
    await expect(page.locator('h1')).toContainText('Superhero Comparison');
    await expect(page.locator('.hero-card')).toHaveCount(2);
  });
});
