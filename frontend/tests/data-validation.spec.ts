import { test, expect } from '@playwright/test';

test.describe('Data Validation and State Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('API returns valid JSON with expected structure', async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/superheroes') && response.status() === 200
      ),
      page.goto('/')
    ]);

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);

    // Validate first hero structure
    const hero = data[0];
    expect(hero).toHaveProperty('id');
    expect(hero).toHaveProperty('name');
    expect(hero).toHaveProperty('image');
    expect(hero).toHaveProperty('powerstats');
    
    // Validate powerstats structure
    const stats = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];
    stats.forEach(stat => {
      expect(hero.powerstats).toHaveProperty(stat);
      expect(typeof hero.powerstats[stat]).toBe('number');
    });
  });

  test('all heroes have unique IDs', async ({ page }) => {
    await page.waitForSelector('tbody tr');
    
    const ids = await page.locator('tbody tr td:nth-child(2)').allTextContents();
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('all heroes have non-empty names', async ({ page }) => {
    await page.waitForSelector('tbody tr');
    
    const names = await page.locator('tbody tr td:nth-child(3)').allTextContents();
    
    names.forEach(name => {
      expect(name.trim()).not.toBe('');
      expect(name.trim().length).toBeGreaterThan(0);
    });
  });

  test('all powerstats are numeric and within valid range', async ({ page }) => {
    await page.waitForSelector('tbody tr');
    
    const rowCount = await page.locator('tbody tr').count();
    
    for (let i = 0; i < rowCount; i++) {
      const row = page.locator('tbody tr').nth(i);
      
      // Check all 6 stat columns (indices 4-9)
      for (let statCol = 4; statCol <= 9; statCol++) {
        const statValue = await row.locator('td').nth(statCol).textContent();
        const numValue = parseInt(statValue?.trim() || '0');
        
        expect(numValue).toBeGreaterThanOrEqual(0);
        expect(numValue).toBeLessThanOrEqual(100);
      }
    }
  });

  test('image URLs are valid and accessible', async ({ page }) => {
    await page.waitForSelector('tbody tr');
    
    const firstImage = page.locator('tbody tr').first().locator('td img');
    const src = await firstImage.getAttribute('src');
    
    expect(src).toBeTruthy();
    expect(src).toMatch(/^https?:\/\//);
    
    // Verify image loads without error
    await expect(firstImage).toBeVisible();
  });

  test('selection state is managed correctly in React', async ({ page }) => {
    await page.waitForSelector('tbody tr');

    // Initial state - nothing selected
    let selectedText = await page.locator('.selection-info p').textContent();
    expect(selectedText).toContain('(0/2 selected)');

    // Select first hero
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    selectedText = await page.locator('.selection-info p').textContent();
    expect(selectedText).toContain('(1/2 selected)');

    // Select second hero
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    selectedText = await page.locator('.selection-info p').textContent();
    expect(selectedText).toContain('(2/2 selected)');

    // Deselect first hero
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').uncheck();
    selectedText = await page.locator('.selection-info p').textContent();
    expect(selectedText).toContain('(1/2 selected)');
  });

  test('view state switches correctly between table and comparison', async ({ page }) => {
    await page.waitForSelector('tbody tr');

    // Initially in table view
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('.comparison-view')).not.toBeVisible();

    // Switch to comparison view
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    await expect(page.locator('h1')).toContainText('Superhero Comparison');
    await expect(page.locator('table')).not.toBeVisible();
    await expect(page.locator('.comparison-view')).toBeVisible();

    // Switch back to table view
    await page.locator('button.back-button').click();

    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('.comparison-view')).not.toBeVisible();
  });

  test('selection limit prevents more than 2 heroes', async ({ page }) => {
    await page.waitForSelector('tbody tr');

    // Select first two heroes
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();

    const checkedCount1 = await page.locator('input[type="checkbox"]:checked').count();
    expect(checkedCount1).toBe(2);

    // Try to select third hero
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();

    // Still only 2 should be checked
    const checkedCount2 = await page.locator('input[type="checkbox"]:checked').count();
    expect(checkedCount2).toBe(2);
  });

  test('console has no errors during normal operation', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForSelector('tbody tr');
    
    // Perform normal operations
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
    await page.locator('button.back-button').click();

    // Should have no console errors
    expect(consoleErrors.length).toBe(0);
  });
});
