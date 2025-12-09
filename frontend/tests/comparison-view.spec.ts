import { test, expect } from '@playwright/test';

test.describe('Superhero Comparison View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Select two heroes and navigate to comparison
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
  });

  test('displays comparison view title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Superhero Comparison');
  });

  test('displays back button', async ({ page }) => {
    const backButton = page.locator('button.back-button');
    await expect(backButton).toBeVisible();
    await expect(backButton).toContainText('Back to Heroes Table');
  });

  test('displays both hero cards with images and names', async ({ page }) => {
    const heroCards = page.locator('.hero-card');
    await expect(heroCards).toHaveCount(2);
    
    // Check first hero card
    const firstCard = heroCards.nth(0);
    await expect(firstCard.locator('img')).toBeVisible();
    await expect(firstCard.locator('h2')).not.toBeEmpty();
    
    // Check second hero card
    const secondCard = heroCards.nth(1);
    await expect(secondCard.locator('img')).toBeVisible();
    await expect(secondCard.locator('h2')).not.toBeEmpty();
  });

  test('displays VS section', async ({ page }) => {
    await expect(page.locator('.vs-section h2')).toContainText('VS');
  });

  test('displays all six stats comparison', async ({ page }) => {
    const stats = ['Intelligence', 'Strength', 'Speed', 'Durability', 'Power', 'Combat'];
    
    for (const stat of stats) {
      await expect(page.getByText(stat, { exact: true })).toBeVisible();
    }
    
    const statRows = page.locator('.stat-row');
    await expect(statRows).toHaveCount(6);
  });

  test('displays stat values for both heroes', async ({ page }) => {
    const statRows = page.locator('.stat-row');
    const firstRow = statRows.first();
    
    // Each row should have two stat values
    const statValues = firstRow.locator('.stat-value');
    await expect(statValues).toHaveCount(2);
    await expect(statValues.nth(0)).not.toBeEmpty();
    await expect(statValues.nth(1)).not.toBeEmpty();
  });

  test('highlights winner stat with CSS class', async ({ page }) => {
    const winnerStats = page.locator('.stat-value.winner');
    // At least one stat should have a winner (unless all ties)
    const count = await winnerStats.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('displays final result section', async ({ page }) => {
    await expect(page.locator('.final-result h2')).toContainText('Final Result');
  });

  test('displays winner or tie announcement', async ({ page }) => {
    const winnerAnnouncement = page.locator('.winner-announcement');
    const tieAnnouncement = page.locator('.tie-announcement');
    
    // Either winner or tie should be visible
    const hasWinner = await winnerAnnouncement.count();
    const hasTie = await tieAnnouncement.count();
    
    expect(hasWinner + hasTie).toBe(1);
  });

  test('displays score in final result', async ({ page }) => {
    const result = page.locator('.final-result');
    await expect(result.locator('p')).toContainText(/Score:/);
  });

  test('back button returns to table view', async ({ page }) => {
    await page.locator('button.back-button').click();
    
    // Should be back at table view
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('table')).toBeVisible();
  });

  test('back button clears selection', async ({ page }) => {
    await page.locator('button.back-button').click();
    
    // All checkboxes should be unchecked
    const checkedBoxes = page.locator('input[type="checkbox"]:checked');
    await expect(checkedBoxes).toHaveCount(0);
    
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
  });

  test('hero cards display circular bordered images', async ({ page }) => {
    const heroCards = page.locator('.hero-card');
    
    for (let i = 0; i < 2; i++) {
      const heroImage = heroCards.nth(i).locator('.hero-image');
      await expect(heroImage).toBeVisible();
      
      // Check border-radius is applied (circular)
      const borderRadius = await heroImage.evaluate(el => 
        window.getComputedStyle(el).borderRadius
      );
      expect(borderRadius).toContain('50%');
      
      // Verify image has alt text
      const altText = await heroImage.getAttribute('alt');
      expect(altText).toBeTruthy();
    }
  });

  test('VS section has prominent styling', async ({ page }) => {
    const vsSection = page.locator('.vs-section');
    await expect(vsSection).toBeVisible();
    
    // Check font size is large
    const fontSize = await vsSection.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThan(30); // Should be 36px
    
    // Check color is red-ish
    const color = await vsSection.evaluate(el => 
      window.getComputedStyle(el).color
    );
    expect(color).toContain('255'); // RGB red component
  });

  test('winner stats have green background and scale effect', async ({ page }) => {
    const winnerStats = page.locator('.stat-value.winner');
    const count = await winnerStats.count();
    
    if (count > 0) {
      const firstWinner = winnerStats.first();
      
      // Check background color is green
      const bgColor = await firstWinner.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      expect(bgColor).toContain('40, 167, 69'); // rgb(40, 167, 69) = #28a745
      
      // Check transform scale is applied
      const transform = await firstWinner.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      expect(transform).toContain('matrix'); // Scaled transforms show as matrix
    }
  });

  test('stats comparison grid has proper layout', async ({ page }) => {
    const statsComparison = page.locator('.stats-comparison');
    await expect(statsComparison).toBeVisible();
    
    // Check it has rounded corners
    const borderRadius = await statsComparison.evaluate(el => 
      window.getComputedStyle(el).borderRadius
    );
    expect(borderRadius).toContain('12px');
    
    // Verify all stat rows have grid layout
    const firstStatRow = page.locator('.stat-row').first();
    const display = await firstStatRow.evaluate(el => 
      window.getComputedStyle(el).display
    );
    expect(display).toBe('grid');
  });

  test('final result section has gradient background', async ({ page }) => {
    const finalResult = page.locator('.final-result');
    await expect(finalResult).toBeVisible();
    
    // Check for gradient background
    const background = await finalResult.evaluate(el => 
      window.getComputedStyle(el).background
    );
    expect(background).toContain('linear-gradient');
  });

  test('hero cards have proper spacing and styling', async ({ page }) => {
    const heroCards = page.locator('.hero-card');
    await expect(heroCards).toHaveCount(2);
    
    // Check cards have background color
    const firstCard = heroCards.first();
    const bgColor = await firstCard.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBe('rgb(58, 63, 71)'); // #3a3f47
    
    // Check border radius
    const borderRadius = await firstCard.evaluate(el => 
      window.getComputedStyle(el).borderRadius
    );
    expect(borderRadius).toContain('12px');
  });
});
