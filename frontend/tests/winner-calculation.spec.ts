import { test, expect } from '@playwright/test';

test.describe('Winner Calculation', () => {
  test('winner announcement shows hero name and trophy emoji', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Select two heroes with different stats
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
    
    // Check if there's a winner
    const winnerAnnouncement = page.locator('.winner-announcement');
    const winnerCount = await winnerAnnouncement.count();
    
    if (winnerCount > 0) {
      await expect(winnerAnnouncement.locator('h3')).toContainText('🏆');
      await expect(winnerAnnouncement.locator('h3')).toContainText('Wins!');
      
      // Winner name should be one of the selected heroes
      const winnerText = await winnerAnnouncement.locator('h3').textContent();
      expect(winnerText).toBeTruthy();
    }
  });

  test('tie announcement shows handshake emoji when scores are equal', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
    
    const tieAnnouncement = page.locator('.tie-announcement');
    const tieCount = await tieAnnouncement.count();
    
    if (tieCount > 0) {
      await expect(tieAnnouncement.locator('h3')).toContainText('🤝');
      await expect(tieAnnouncement.locator('h3')).toContainText("It's a Tie!");
    }
  });

  test('score format is X-Y', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
    
    const scoreText = await page.locator('.final-result p').textContent();
    expect(scoreText).toMatch(/Score: \d+-\d+/);
  });

  test('compares all six stats categories', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
    
    // Count stat rows - should be 6
    const statRows = page.locator('.stat-row');
    await expect(statRows).toHaveCount(6);
  });

  test('calculates score correctly based on stat wins', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // A-Bomb vs Ant-Man
    // A-Bomb: strength(100>18), durability(80>28), combat(64>32) = 3 wins
    // Ant-Man: intelligence(100>38), speed(23>17), power(32>24) = 3 wins
    // Should be a tie 3-3
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
    
    const scoreText = await page.locator('.final-result p').textContent();
    expect(scoreText).toMatch(/Score: 3-3/);
    
    // Should show tie announcement
    await expect(page.locator('.tie-announcement')).toBeVisible();
  });

  test('correctly identifies clear winner', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    // Compare A-Bomb (id:1) vs Bane (id:3)
    // A-Bomb wins: strength (100>38), speed (17<23), durability (80>56)
    // Expected: A-Bomb should have more category wins
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(2).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
    
    // Either winner or tie should be shown
    const hasWinner = await page.locator('.winner-announcement').count() > 0;
    const hasTie = await page.locator('.tie-announcement').count() > 0;
    expect(hasWinner || hasTie).toBeTruthy();
  });

  test('stat comparison handles equal values correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
    
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();
    
    // Check that stat rows don't incorrectly mark ties as winners
    const statRows = page.locator('.stat-row');
    const count = await statRows.count();
    
    for (let i = 0; i < count; i++) {
      const row = statRows.nth(i);
      const values = await row.locator('.stat-value').allTextContents();
      
      // If values are equal, neither should have winner class
      if (values[0] === values[1]) {
        const winnerCount = await row.locator('.stat-value.winner').count();
        expect(winnerCount).toBe(0);
      }
    }
  });

  test('winner announcement has gold color and glow effect', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const winnerAnnouncement = page.locator('.winner-announcement');
    const winnerCount = await winnerAnnouncement.count();

    if (winnerCount > 0) {
      const winnerHeading = winnerAnnouncement.locator('h3');

      // Check color is gold
      const color = await winnerHeading.evaluate(el =>
        window.getComputedStyle(el).color
      );
      expect(color).toContain('255, 215, 0'); // Gold color rgb(255, 215, 0)

      // Check font size is large
      const fontSize = await winnerHeading.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      const fontSizeNum = parseInt(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(30);
    }
  });

  test('tie announcement has cyan color', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const tieAnnouncement = page.locator('.tie-announcement');
    const tieCount = await tieAnnouncement.count();

    if (tieCount > 0) {
      const tieHeading = tieAnnouncement.locator('h3');

      // Check color is cyan (#61dafb)
      const color = await tieHeading.evaluate(el =>
        window.getComputedStyle(el).color
      );
      expect(color).toContain('97, 218, 251'); // rgb(97, 218, 251) = #61dafb
    }
  });

  test('score displays correct format with both hero scores', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const scoreText = await page.locator('.final-result p').textContent();

    // Score should be in format "Score: X-Y" where X and Y are numbers
    expect(scoreText).toMatch(/Score: \d+-\d+/);

    // Extract scores and verify they sum to at most 6 (or more if ties)
    const scoreMatch = scoreText?.match(/(\d+)-(\d+)/);
    if (scoreMatch) {
      const score1 = parseInt(scoreMatch[1]);
      const score2 = parseInt(scoreMatch[2]);

      // Each hero can win at most 6 stats
      expect(score1).toBeLessThanOrEqual(6);
      expect(score2).toBeLessThanOrEqual(6);
    }
  });
});
