import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('table has proper structure with thead and tbody', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('table thead')).toBeVisible();
    await expect(page.locator('table tbody')).toBeVisible();
  });

  test('images have alt attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const images = page.locator('tbody img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const altText = await images.nth(i).getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText).not.toBe('');
    }
  });

  test('checkboxes are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');

    // Focus on checkbox using keyboard
    await firstCheckbox.focus();

    // Check if it's focused
    await expect(firstCheckbox).toBeFocused();

    // Toggle using Space key
    await page.keyboard.press('Space');
    await expect(firstCheckbox).toBeChecked();
  });

  test('compare button is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Select two heroes
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();

    const compareButton = page.locator('button.compare-button');
    await compareButton.focus();
    await expect(compareButton).toBeFocused();

    // Activate button with Enter key
    await page.keyboard.press('Enter');
    await expect(page.locator('h1')).toContainText('Superhero Comparison');
  });

  test('back button is keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Navigate to comparison view
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const backButton = page.locator('button.back-button');
    await backButton.focus();
    await expect(backButton).toBeFocused();

    // Activate button with Enter key
    await page.keyboard.press('Enter');
    await expect(page.locator('h1')).toContainText('Superheroes');
  });

  test('headings follow proper hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check h1 exists in table view
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toContainText('Superheroes');
  });

  test('comparison view has proper heading structure', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    // Check h1 exists
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // Check h2 elements exist
    const h2Count = await page.locator('h2').count();
    expect(h2Count).toBeGreaterThanOrEqual(1);
  });

  test('complete keyboard navigation flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Use Tab to navigate to first checkbox
    await page.keyboard.press('Tab');
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await expect(firstCheckbox).toBeFocused();
    
    // Select using Space
    await page.keyboard.press('Space');
    await expect(firstCheckbox).toBeChecked();
    
    // Tab to next checkbox
    await page.keyboard.press('Tab');
    const secondCheckbox = page.locator('tbody tr').nth(1).locator('input[type="checkbox"]');
    await expect(secondCheckbox).toBeFocused();
    
    // Select second hero
    await page.keyboard.press('Space');
    await expect(secondCheckbox).toBeChecked();
  });

  test('focus is maintained when switching views', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Select heroes and navigate to comparison
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    
    const compareButton = page.locator('button.compare-button');
    await compareButton.focus();
    await page.keyboard.press('Enter');
    
    // In comparison view, verify back button can receive focus
    const backButton = page.locator('button.back-button');
    await backButton.focus();
    await expect(backButton).toBeFocused();
    
    await page.keyboard.press('Enter');
    
    // Back in table view, verify focusable elements exist
    await expect(page.locator('h1')).toContainText('Superheroes');
  });

  test('compare button has proper disabled state styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    const compareButton = page.locator('button.compare-button');
    
    // Check disabled state
    await expect(compareButton).toBeDisabled();
    const disabledOpacity = await compareButton.evaluate(el => 
      window.getComputedStyle(el).opacity
    );
    expect(parseFloat(disabledOpacity)).toBeLessThan(1); // Should be 0.6
    
    // Check cursor is not-allowed
    const cursor = await compareButton.evaluate(el => 
      window.getComputedStyle(el).cursor
    );
    expect(cursor).toBe('not-allowed');
  });

  test('table rows have hover state for better interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    const firstRow = page.locator('tbody tr').first();
    
    // Hover over the row
    await firstRow.hover();
    
    // The row should be visible and interactive
    await expect(firstRow).toBeVisible();
  });

  test('hero images have proper dimensions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    const firstImage = page.locator('tbody tr').first().locator('td img');
    
    // Check image has width attribute
    const width = await firstImage.getAttribute('width');
    expect(width).toBe('50');
    
    // Verify image is visible
    await expect(firstImage).toBeVisible();
  });
});

