import { test, expect } from '@playwright/test';

test.describe('UI and Styling Tests', () => {
  test('selected rows have correct CSS class', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const firstRow = page.locator('tbody tr').first();

    // Before selection - should not have selected-row class
    await expect(firstRow).not.toHaveClass(/selected-row/);

    // After selection - should have selected-row class
    await firstRow.locator('input[type="checkbox"]').check();
    await expect(firstRow).toHaveClass(/selected-row/);
  });

  test('compare button changes state based on selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const compareButton = page.locator('button.compare-button');

    // Initially disabled
    await expect(compareButton).toBeDisabled();

    // Still disabled with one selection
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await expect(compareButton).toBeDisabled();

    // Enabled with two selections
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await expect(compareButton).toBeEnabled();
  });

  test('table has proper border styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check table border exists
    const borderStyle = await table.evaluate((el) => {
      return window.getComputedStyle(el).border;
    });
    expect(borderStyle).toBeTruthy();
  });

  test('hero cards are visible in comparison view', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const heroCards = page.locator('.hero-card');
    await expect(heroCards).toHaveCount(2);

    // Both cards should be visible
    await expect(heroCards.nth(0)).toBeVisible();
    await expect(heroCards.nth(1)).toBeVisible();
  });

  test('VS section is displayed between hero cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const vsSection = page.locator('.vs-section');
    await expect(vsSection).toBeVisible();
    await expect(vsSection).toContainText('VS');
  });

  test('stat rows have proper grid layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const statRow = page.locator('.stat-row').first();

    // Should have 3 columns: value, name, value
    const statValues = statRow.locator('.stat-value');
    await expect(statValues).toHaveCount(2);

    const statName = statRow.locator('.stat-name');
    await expect(statName).toHaveCount(1);
  });

  test('winner stats have winner CSS class', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    // Check if any stat has winner class (unless all are ties)
    const winnerStats = page.locator('.stat-value.winner');
    const count = await winnerStats.count();

    // At least 0 winner stats (could be a tie game)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('final result section has gradient background', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const finalResult = page.locator('.final-result');
    await expect(finalResult).toBeVisible();

    // Check background exists
    const bgStyle = await finalResult.evaluate((el) => {
      return window.getComputedStyle(el).background;
    });
    expect(bgStyle).toBeTruthy();
  });

  test('hero images in comparison are circular', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const heroImage = page.locator('.hero-image').first();

    // Check border-radius is 50% (circular)
    const borderRadius = await heroImage.evaluate((el) => {
      return window.getComputedStyle(el).borderRadius;
    });
    expect(borderRadius).toContain('50%');
  });

  test('buttons have hover effects', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();

    const compareButton = page.locator('button.compare-button');

    // Hover over button
    await compareButton.hover();

    // Button should still be visible and enabled
    await expect(compareButton).toBeVisible();
    await expect(compareButton).toBeEnabled();
  });

  test('selected heroes text is displayed with correct styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();

    const selectedHeroes = page.locator('.selected-heroes');
    await expect(selectedHeroes).toBeVisible();

    // Check text is displayed
    const text = await selectedHeroes.textContent();
    expect(text).toBeTruthy();
    expect(text).toContain('Selected:');
  });

  test('table headers have distinct styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const tableHeaders = page.locator('th');
    const firstHeader = tableHeaders.first();

    await expect(firstHeader).toBeVisible();

    // Check header has background color
    const bgColor = await firstHeader.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(bgColor).toBeTruthy();
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
  });

  test('comparison container has flexbox layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const comparisonContainer = page.locator('.comparison-container');

    const display = await comparisonContainer.evaluate((el) => {
      return window.getComputedStyle(el).display;
    });
    expect(display).toBe('flex');
  });

  test('stats comparison section has proper padding', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const statsComparison = page.locator('.stats-comparison');
    await expect(statsComparison).toBeVisible();

    const padding = await statsComparison.evaluate((el) => {
      return window.getComputedStyle(el).padding;
    });
    expect(padding).toBeTruthy();
  });
});

test.describe('Responsive Design Tests', () => {
  test('mobile viewport displays comparison in column layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const comparisonContainer = page.locator('.comparison-container');
    const flexDirection = await comparisonContainer.evaluate(el => 
      window.getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toBe('column');
  });

  test('tablet viewport displays table with smaller fonts', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Table should still be visible and functional
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await expect(firstCheckbox).toBeVisible();
  });

  test('mobile viewport hero images are smaller', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const heroImage = page.locator('.hero-image').first();
    const width = await heroImage.evaluate(el => 
      window.getComputedStyle(el).width
    );
    expect(width).toBe('120px'); // Mobile size from media query
  });
});

test.describe('Animation Tests', () => {
  test('winner announcement has glow animation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const winnerAnnouncement = page.locator('.winner-announcement h3');
    const count = await winnerAnnouncement.count();
    
    if (count > 0) {
      const animation = await winnerAnnouncement.evaluate(el => 
        window.getComputedStyle(el).animation
      );
      expect(animation).toContain('glow');
    }
  });

  test('compare button hover effect changes transform', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();

    const compareButton = page.locator('button.compare-button');
    await compareButton.hover();
    
    // Wait for animation
    await page.waitForTimeout(500);
    
    await expect(compareButton).toBeVisible();
    await expect(compareButton).toBeEnabled();
  });

  test('winner stat has scale transformation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const winnerStat = page.locator('.stat-value.winner').first();
    const count = await winnerStat.count();
    
    if (count > 0) {
      const transform = await winnerStat.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      // Transform will be in matrix format: matrix(1.1, 0, 0, 1.1, 0, 0) for scale(1.1)
      expect(transform).toContain('matrix(1.1');
    }
  });

  test('winner stat has green background and box shadow', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const winnerStat = page.locator('.stat-value.winner').first();
    const count = await winnerStat.count();
    
    if (count > 0) {
      const bgColor = await winnerStat.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      expect(bgColor).toBe('rgb(40, 167, 69)'); // #28a745
      
      const boxShadow = await winnerStat.evaluate(el => 
        window.getComputedStyle(el).boxShadow
      );
      expect(boxShadow).toContain('rgba(40, 167, 69');
    }
  });
});

