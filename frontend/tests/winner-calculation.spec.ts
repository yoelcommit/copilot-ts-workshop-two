import { test, expect } from '@playwright/test';

test.describe('Winner Calculation Logic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForSelector('tbody tr');
  });

  test('should show A-Bomb wins against Ant-Man (tie scenario)', async ({ page }) => {
    // Select A-Bomb (id: 1) and Ant-Man (id: 2)
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Compare Heroes/i }).click();
    
    // Should show tie with score 3-3
    await expect(page.locator('.tie-announcement h3')).toBeVisible();
    await expect(page.locator('.tie-announcement h3')).toContainText("It's a Tie!");
    await expect(page.locator('.tie-announcement p')).toContainText('3-3');
  });

  test('should show Bane wins against Ant-Man', async ({ page }) => {
    // Select Ant-Man (id: 2) and Bane (id: 3)
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Compare Heroes/i }).click();
    
    // Bane vs Ant-Man:
    // Intelligence: 88 vs 100 (Ant-Man wins)
    // Strength: 38 vs 18 (Bane wins)
    // Speed: 23 vs 23 (Tie)
    // Durability: 56 vs 28 (Bane wins)
    // Power: 51 vs 32 (Bane wins)
    // Combat: 95 vs 32 (Bane wins)
    // Result: Bane wins 4-1
    
    await expect(page.locator('.winner-announcement h3')).toBeVisible();
    await expect(page.locator('.winner-announcement h3')).toContainText('Bane Wins!');
    await expect(page.locator('.winner-announcement p')).toContainText('4-1');
  });

  test('should show A-Bomb wins against Bane', async ({ page }) => {
    // Select A-Bomb (id: 1) and Bane (id: 3)
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Compare Heroes/i }).click();
    
    // A-Bomb vs Bane:
    // Intelligence: 38 vs 88 (Bane wins)
    // Strength: 100 vs 38 (A-Bomb wins)
    // Speed: 17 vs 23 (Bane wins)
    // Durability: 80 vs 56 (A-Bomb wins)
    // Power: 24 vs 51 (Bane wins)
    // Combat: 64 vs 95 (Bane wins)
    // Result: Bane wins 4-2
    
    await expect(page.locator('.winner-announcement h3')).toBeVisible();
    await expect(page.locator('.winner-announcement h3')).toContainText('Bane Wins!');
    await expect(page.locator('.winner-announcement p')).toContainText('4-2');
  });

  test('should display correct stat values in comparison', async ({ page }) => {
    // Select A-Bomb and Bane
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Compare Heroes/i }).click();
    
    // Verify intelligence row
    const intelligenceRow = page.locator('.stat-row', { has: page.locator('.stat-name', { hasText: 'Intelligence' }) });
    const intelValues = intelligenceRow.locator('.stat-value');
    await expect(intelValues.nth(0)).toHaveText('38');
    await expect(intelValues.nth(1)).toHaveText('88');
    
    // Verify strength row
    const strengthRow = page.locator('.stat-row', { has: page.locator('.stat-name', { hasText: 'Strength' }) });
    const strengthValues = strengthRow.locator('.stat-value');
    await expect(strengthValues.nth(0)).toHaveText('100');
    await expect(strengthValues.nth(1)).toHaveText('38');
  });

  test('should highlight all winning stats correctly', async ({ page }) => {
    // Select Ant-Man and Bane
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: /Compare Heroes/i }).click();
    
    // Count winner highlights (should be 5: 4 for Bane, 1 for Ant-Man)
    const winnerStats = page.locator('.stat-value.winner');
    await expect(winnerStats).toHaveCount(5);
  });
});
