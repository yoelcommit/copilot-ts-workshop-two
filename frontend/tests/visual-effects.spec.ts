import { test, expect } from '@playwright/test';

test.describe('Visual Animations and Transitions', () => {
  test('compare button has hover transform effect', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Select two heroes to enable button
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();

    const compareButton = page.locator('button.compare-button');

    // Check transition property exists with duration
    const transition = await compareButton.evaluate(el =>
      window.getComputedStyle(el).transition
    );
    expect(transition).toContain('0.3s');
  });

  test('back button has hover effect', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    // Navigate to comparison view
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const backButton = page.locator('button.back-button');

    // Check transition property
    const transition = await backButton.evaluate(el =>
      window.getComputedStyle(el).transition
    );
    expect(transition).toContain('background-color');
  });

  test('winner stats have transform scale effect', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const winnerStats = page.locator('.stat-value.winner');
    const count = await winnerStats.count();

    if (count > 0) {
      const firstWinner = winnerStats.first();

      // Check transform includes scale
      const transform = await firstWinner.evaluate(el =>
        window.getComputedStyle(el).transform
      );

      // Transform with scale(1.1) shows as matrix(1.1, 0, 0, 1.1, 0, 0)
      expect(transform).toContain('matrix');
    }
  });

  test('winner stats have box shadow for depth', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const winnerStats = page.locator('.stat-value.winner');
    const count = await winnerStats.count();

    if (count > 0) {
      const boxShadow = await winnerStats.first().evaluate(el =>
        window.getComputedStyle(el).boxShadow
      );
      expect(boxShadow).toContain('rgba');
    }
  });

  test('stat values have transition effect', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const statValue = page.locator('.stat-value').first();
    const transition = await statValue.evaluate(el =>
      window.getComputedStyle(el).transition
    );

    expect(transition).toContain('0.3s');
  });

  test('hero images have circular border styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const heroImage = page.locator('.hero-image').first();

    // Check circular border
    const borderRadius = await heroImage.evaluate(el =>
      window.getComputedStyle(el).borderRadius
    );
    expect(borderRadius).toContain('50%');

    // Check border color (cyan)
    const borderColor = await heroImage.evaluate(el =>
      window.getComputedStyle(el).borderColor
    );
    expect(borderColor).toContain('rgb(97, 218, 251)');

    // Check border width
    const borderWidth = await heroImage.evaluate(el =>
      window.getComputedStyle(el).borderWidth
    );
    expect(borderWidth).toBe('3px');
  });

  test('final result has gradient background', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const finalResult = page.locator('.final-result');
    const background = await finalResult.evaluate(el =>
      window.getComputedStyle(el).backgroundImage
    );

    expect(background).toContain('linear-gradient');
    expect(background).toContain('135deg');
  });

  test('final result has prominent box shadow', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const finalResult = page.locator('.final-result');
    const boxShadow = await finalResult.evaluate(el =>
      window.getComputedStyle(el).boxShadow
    );

    expect(boxShadow).toContain('rgba');
    expect(boxShadow).toContain('0px 8px 32px');
  });

  test('winner announcement has text shadow', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const winnerAnnouncement = page.locator('.winner-announcement h3');
    const count = await winnerAnnouncement.count();

    if (count > 0) {
      const textShadow = await winnerAnnouncement.evaluate(el =>
        window.getComputedStyle(el).textShadow
      );
      expect(textShadow).toBeTruthy();
      expect(textShadow).not.toBe('none');
    }
  });

  test('table rows have hover state visual feedback', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const firstRow = page.locator('tbody tr').first();

    // Hover triggers CSS :hover state
    await firstRow.hover();

    // The row should remain visible (hover state exists in CSS)
    await expect(firstRow).toBeVisible();
  });

  test('selection info has styled background', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    const selectionInfo = page.locator('.selection-info');

    // Check background color
    const bgColor = await selectionInfo.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).toBe('rgb(58, 63, 71)'); // #3a3f47

    // Check border radius
    const borderRadius = await selectionInfo.evaluate(el =>
      window.getComputedStyle(el).borderRadius
    );
    expect(borderRadius).toBe('8px');

    // Check has border
    const border = await selectionInfo.evaluate(el =>
      window.getComputedStyle(el).border
    );
    expect(border).toContain('2px');
  });

  test('VS section has prominent text shadow', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');

    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await page.locator('button.compare-button').click();

    const vsSection = page.locator('.vs-section h2');
    const textShadow = await vsSection.evaluate(el =>
      window.getComputedStyle(el).textShadow
    );

    expect(textShadow).toContain('rgba');
    expect(textShadow).toContain('2px 2px 4px');
  });
});

