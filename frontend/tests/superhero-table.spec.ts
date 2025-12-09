import { test, expect } from '@playwright/test';

test.describe('Superhero Table View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('displays the superheroes table with headers', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Superheroes');
    
    // Check table headers exist with specific locators
    const table = page.locator('table');
    await expect(table).toBeVisible();
    await expect(table.locator('thead')).toBeVisible();
    
    // Verify all expected headers are present
    const headers = ['Select', 'ID', 'Name', 'Image', 'Intelligence', 'Strength', 'Speed', 'Durability', 'Power', 'Combat'];
    for (const header of headers) {
      await expect(page.locator('th', { hasText: header })).toBeVisible();
    }
  });

  test('loads and displays superhero data from API', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('tbody tr', { timeout: 5000 });
    
    // Check that at least one hero is displayed
    const rows = await page.locator('tbody tr').count();
    expect(rows).toBeGreaterThan(0);
    
    // Verify first row has expected structure
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow.locator('td').nth(1)).not.toBeEmpty(); // ID
    await expect(firstRow.locator('td').nth(2)).not.toBeEmpty(); // Name
    await expect(firstRow.locator('td img')).toBeVisible(); // Image
  });

  test('displays selection info showing 0/2 selected initially', async ({ page }) => {
    await expect(page.locator('.selection-info p')).toContainText('Select 2 superheroes to compare (0/2 selected)');
  });

  test('compare button is disabled when no heroes selected', async ({ page }) => {
    const compareButton = page.locator('button.compare-button');
    await expect(compareButton).toBeDisabled();
  });

  test('displays all powerstats for each hero', async ({ page }) => {
    await page.waitForSelector('tbody tr');
    
    const firstRow = page.locator('tbody tr').first();
    // Check that powerstats columns have numeric values
    for (let i = 4; i <= 9; i++) {
      const statCell = firstRow.locator('td').nth(i);
      await expect(statCell).not.toBeEmpty();
      const value = await statCell.textContent();
      expect(value?.trim()).toMatch(/^\d+$/);
    }
  });

  test('table has proper CSS styling', async ({ page }) => {
    await page.waitForSelector('tbody tr');
    const table = page.locator('table');
    
    // Verify border-collapse
    const borderCollapse = await table.evaluate(el => 
      window.getComputedStyle(el).borderCollapse
    );
    expect(borderCollapse).toBe('collapse');
    
    // Verify table has border
    const border = await table.evaluate(el => 
      window.getComputedStyle(el).border
    );
    expect(border).toContain('2px');
  });

  test('table headers have correct background color', async ({ page }) => {
    await page.waitForSelector('thead th');
    const firstHeader = page.locator('thead th').first();
    
    const bgColor = await firstHeader.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBe('rgb(58, 63, 71)'); // #3a3f47
  });

  test('displays hero images with correct alt text', async ({ page }) => {
    await page.waitForSelector('tbody tr');

    // Get first hero's name and image
    const firstRow = page.locator('tbody tr').first();
    const heroName = await firstRow.locator('td').nth(2).textContent();
    const heroImage = firstRow.locator('td img');

    // Verify image is visible and has alt text matching hero name
    await expect(heroImage).toBeVisible();
    const altText = await heroImage.getAttribute('alt');
    expect(altText).toBe(heroName?.trim());
  });

  test('loads expected number of superheroes', async ({ page }) => {
    await page.waitForSelector('tbody tr');

    // Verify we have at least 1 hero loaded
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThanOrEqual(1);

    // Should have reasonable number of heroes
    expect(rowCount).toBeLessThanOrEqual(100);
  });

  test('hero row contains all required data columns', async ({ page }) => {
    await page.waitForSelector('tbody tr');

    const firstRow = page.locator('tbody tr').first();
    const cellCount = await firstRow.locator('td').count();

    // Should have 10 columns: Select, ID, Name, Image, and 6 stats
    expect(cellCount).toBe(10);
  });
});
