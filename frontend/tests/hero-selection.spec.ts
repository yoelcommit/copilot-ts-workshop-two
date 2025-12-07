import { test, expect } from '@playwright/test';

test.describe('Hero Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('tbody tr');
  });

  test('can select a single hero', async ({ page }) => {
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await firstCheckbox.check();
    
    await expect(firstCheckbox).toBeChecked();
    await expect(page.locator('.selection-info p')).toContainText('(1/2 selected)');
  });

  test('can select two heroes', async ({ page }) => {
    const firstCheckbox = page.locator('tbody tr').nth(0).locator('input[type="checkbox"]');
    const secondCheckbox = page.locator('tbody tr').nth(1).locator('input[type="checkbox"]');
    
    await firstCheckbox.check();
    await secondCheckbox.check();
    
    await expect(firstCheckbox).toBeChecked();
    await expect(secondCheckbox).toBeChecked();
    await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');
  });

  test('can deselect a hero', async ({ page }) => {
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    
    await firstCheckbox.check();
    await expect(page.locator('.selection-info p')).toContainText('(1/2 selected)');
    
    await firstCheckbox.uncheck();
    await expect(firstCheckbox).not.toBeChecked();
    await expect(page.locator('.selection-info p')).toContainText('(0/2 selected)');
  });

  test('displays selected heroes names', async ({ page }) => {
    const firstRow = page.locator('tbody tr').nth(0);
    const secondRow = page.locator('tbody tr').nth(1);
    
    const firstName = await firstRow.locator('td').nth(2).textContent();
    const secondName = await secondRow.locator('td').nth(2).textContent();
    
    await firstRow.locator('input[type="checkbox"]').check();
    await secondRow.locator('input[type="checkbox"]').check();
    
    const selectedText = await page.locator('.selected-heroes').textContent();
    expect(selectedText).toContain(firstName);
    expect(selectedText).toContain(secondName);
  });

  test('highlights selected rows with CSS class', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('input[type="checkbox"]').check();
    
    await expect(firstRow).toHaveClass(/selected-row/);
  });

  test('replaces first selection when selecting third hero', async ({ page }) => {
    const firstCheckbox = page.locator('tbody tr').nth(0).locator('input[type="checkbox"]');
    const secondCheckbox = page.locator('tbody tr').nth(1).locator('input[type="checkbox"]');
    const thirdCheckbox = page.locator('tbody tr').nth(2).locator('input[type="checkbox"]');
    
    // Select first two
    await firstCheckbox.check();
    await secondCheckbox.check();
    await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');
    
    // Select third - should deselect first
    await thirdCheckbox.check();
    await expect(firstCheckbox).not.toBeChecked();
    await expect(secondCheckbox).toBeChecked();
    await expect(thirdCheckbox).toBeChecked();
    await expect(page.locator('.selection-info p')).toContainText('(2/2 selected)');
  });

  test('enables compare button when two heroes selected', async ({ page }) => {
    const compareButton = page.locator('button.compare-button');
    await expect(compareButton).toBeDisabled();
    
    await page.locator('tbody tr').nth(0).locator('input[type="checkbox"]').check();
    await expect(compareButton).toBeDisabled();
    
    await page.locator('tbody tr').nth(1).locator('input[type="checkbox"]').check();
    await expect(compareButton).toBeEnabled();
  });

  test('selected row has highlighted background', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();

    // Get initial background color
    const initialBgColor = await firstRow.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );

    // Select the hero
    await firstRow.locator('input[type="checkbox"]').check();

    // Verify row has selected-row class
    await expect(firstRow).toHaveClass(/selected-row/);

    // Check background color changed
    const selectedBgColor = await firstRow.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(selectedBgColor).toBe('rgb(74, 85, 104)'); // #4a5568
  });

  test('selected rows maintain visual highlight', async ({ page }) => {
    const firstRow = page.locator('tbody tr').nth(0);
    const secondRow = page.locator('tbody tr').nth(1);

    // Select two heroes
    await firstRow.locator('input[type="checkbox"]').check();
    await secondRow.locator('input[type="checkbox"]').check();

    // Both should have selected-row class
    await expect(firstRow).toHaveClass(/selected-row/);
    await expect(secondRow).toHaveClass(/selected-row/);

    // Verify they both have the highlighted background
    for (const row of [firstRow, secondRow]) {
      const bgColor = await row.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      expect(bgColor).toBe('rgb(74, 85, 104)');
    }
  });

  test('deselecting removes row highlight', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    const checkbox = firstRow.locator('input[type="checkbox"]');

    // Select and verify highlight
    await checkbox.check();
    await expect(firstRow).toHaveClass(/selected-row/);

    // Deselect
    await checkbox.uncheck();

    // Verify highlight is removed
    const className = await firstRow.getAttribute('class');
    expect(className).not.toContain('selected-row');
  });

  test('checkbox is properly styled with accent color', async ({ page }) => {
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');

    // Check the checkbox has accent color styling
    const accentColor = await firstCheckbox.evaluate(el =>
      window.getComputedStyle(el).accentColor
    );
    expect(accentColor).toContain('rgb(97, 218, 251)'); // #61dafb
  });
});
