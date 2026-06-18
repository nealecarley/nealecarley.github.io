const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

test.describe('Cover Page', () => {
  test('loads and shows all key elements', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('.cover-page')).toBeVisible();
    await expect(page.locator('.cover-title')).toBeVisible();
    await expect(page.locator('#enter-showcase')).toBeVisible();
    await expect(page.locator('.bio-card')).toBeVisible();
  });

  test('populates thumbnail grid with 11 items', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.cover-thumbnail', { timeout: 5000 });
    const thumbnails = page.locator('.cover-thumbnail');
    await expect(thumbnails).toHaveCount(11);
  });
});

test.describe('Gallery Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}?view=gallery&week=1`);
    await page.waitForSelector('#main-showcase.active', { timeout: 5000 });
  });

  test('enters gallery from cover page via URL', async ({ page }) => {
    await expect(page.locator('#main-showcase')).toBeVisible();
    await expect(page.locator('#week-indicator')).toBeVisible();
    await expect(page.locator('#prev-week')).toBeVisible();
    await expect(page.locator('#next-week')).toBeVisible();
  });

  test('displays artwork and story on entry', async ({ page }) => {
    await expect(page.locator('.artwork-image')).toBeVisible();
    await expect(page.locator('.story-content')).toBeVisible();
    await expect(page.locator('.story-title')).toBeVisible();
  });

  for (const weekNum of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
    test(`can navigate to week ${weekNum} via next button and see artwork`, async ({ page }) => {
      for (let i = 1; i < weekNum; i++) {
        await page.click('#next-week');
        await page.waitForTimeout(400);
      }
      await expect(page.locator('#week-indicator')).toContainText(`Week ${weekNum}`);
      await expect(page.locator('.artwork-image')).toBeVisible();
      await expect(page.locator('.story-content')).toBeVisible();
    });
  }

  test('wraps around from week 1 to week 11 on prev', async ({ page }) => {
    await page.click('#prev-week');
    await page.waitForTimeout(400);
    await expect(page.locator('#week-indicator')).toContainText('Week 11');
    await expect(page.locator('.artwork-image')).toBeVisible();
  });

  test('wraps around from week 11 to week 1 on next', async ({ page }) => {
    for (let i = 1; i < 11; i++) {
      await page.click('#next-week');
      await page.waitForTimeout(300);
    }
    await expect(page.locator('#week-indicator')).toContainText('Week 11');
    await page.click('#next-week');
    await page.waitForTimeout(400);
    await expect(page.locator('#week-indicator')).toContainText('Week 1');
  });
});

test.describe('Cover Enter Button', () => {
  test('clicking enter shows gallery', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.cover-thumbnail', { timeout: 5000 });
    await page.click('#enter-showcase');
    await page.waitForSelector('#main-showcase.active', { timeout: 5000 });
    await expect(page.locator('.artwork-image')).toBeVisible();
  });

  test('back button returns to cover page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.cover-thumbnail', { timeout: 5000 });
    await page.click('#enter-showcase');
    await page.waitForSelector('#main-showcase.active', { timeout: 5000 });
    await page.click('#back-to-cover');
    await expect(page.locator('.cover-page')).toBeVisible();
    await expect(page.locator('#enter-showcase')).toBeVisible();
  });
});

test.describe('Lightbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}?view=gallery&week=1`);
    await page.waitForSelector('#main-showcase.active', { timeout: 5000 });
    await page.waitForSelector('.artwork-image', { timeout: 5000 });
  });

  test('opens lightbox on artwork click', async ({ page }) => {
    await page.click('.artwork-image');
    const overlay = page.locator('#lightbox-overlay');
    await expect(overlay).toHaveClass(/open/);
    await expect(page.locator('#lightbox-image')).toBeVisible();
  });

  test('closes lightbox on close button', async ({ page }) => {
    await page.click('.artwork-image');
    await page.waitForSelector('#lightbox-overlay.open');
    await page.click('.lightbox-close');
    await expect(page.locator('#lightbox-overlay')).not.toHaveClass(/open/);
  });

  test('navigates lightbox to next artwork', async ({ page }) => {
    await page.click('.artwork-image');
    await page.waitForSelector('#lightbox-overlay.open');
    const prevSrc = await page.locator('#lightbox-image').getAttribute('src');
    await page.click('.lightbox-nav--next');
    await page.waitForTimeout(300);
    const newSrc = await page.locator('#lightbox-image').getAttribute('src');
    expect(newSrc).not.toBe(prevSrc);
  });

  test('navigates lightbox to previous artwork', async ({ page }) => {
    await page.click('.artwork-image');
    await page.waitForSelector('#lightbox-overlay.open');
    const prevSrc = await page.locator('#lightbox-image').getAttribute('src');
    await page.click('.lightbox-nav--prev');
    await page.waitForTimeout(300);
    const newSrc = await page.locator('#lightbox-image').getAttribute('src');
    expect(newSrc).not.toBe(prevSrc);
  });
});

test.describe('Cover Thumbnail Clicks', () => {
  test('each thumbnail navigates to gallery with artwork visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForSelector('.cover-thumbnail', { timeout: 5000 });
    const thumbnails = page.locator('.cover-thumbnail');
    const count = await thumbnails.count();
    for (let i = 0; i < count; i++) {
      await page.goto(BASE_URL);
      await page.waitForSelector('.cover-thumbnail', { timeout: 5000 });
      await page.locator('.cover-thumbnail').nth(i).click();
      await page.waitForSelector('#main-showcase.active', { timeout: 5000 });
      await expect(page.locator('.artwork-image')).toBeVisible();
    }
  });
});
