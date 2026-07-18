import { expect, test } from '@playwright/test';

const userBase = (process.env.PHASE15_USER_URL || 'http://localhost:5173').replace(/\/$/, '');
const adminBase = (process.env.PHASE15_ADMIN_URL || 'http://localhost:5174').replace(/\/$/, '');

const customerPages = [
  ['home', '/'],
  ['services', '/services'],
  ['legacy-products-redirect', '/products', '/services'],
  ['service-booking', '/service-booking'],
  ['faq', '/faq'],
  ['policy-booking', '/policy/booking'],
  ['policy-cookies', '/policy/cookies'],
  ['login', '/login'],
];

async function installMockApiBridge(page, pageUrl) {
  const pageOrigin = new URL(pageUrl).origin;
  await page.route(/http:\/\/(?:127\.0\.0\.1|localhost):3001\/.*/, async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': pageOrigin,
          'access-control-allow-credentials': 'true',
          'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
          'access-control-allow-headers': 'Content-Type,Accept,Authorization,X-Requested-With,Cookie',
        },
      });
      return;
    }

    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: {
        ...response.headers(),
        'access-control-allow-origin': pageOrigin,
        'access-control-allow-credentials': 'true',
      },
    });
  });
}

async function verifyResponsivePage(page, url, testInfo, label) {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await installMockApiBridge(page, url);

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  expect(response?.status(), `${label} must load`).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible();
  await expect
    .poll(
      () => page.evaluate(() => document.body.innerText.trim().length),
      { message: `${label} must finish loading meaningful content`, timeout: 15_000 },
    )
    .toBeGreaterThan(40);

  const viewport = page.viewportSize();
  expect(viewport?.width).toBeGreaterThan(300);
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    title: document.title,
  }));

  expect(layout.title, `${label} must set a document title`).not.toBe('');
  expect(
    layout.scrollWidth,
    `${label} must not cause horizontal overflow`,
  ).toBeLessThanOrEqual(layout.clientWidth + 2);
  expect(pageErrors, `${label} must not throw runtime errors`).toEqual([]);

  await page.screenshot({
    path: testInfo.outputPath(`${label}.png`),
    fullPage: false,
  });
}

test.describe('customer portal responsive acceptance', () => {
  for (const [name, path, expectedPath] of customerPages) {
    test(`${name} remains usable`, async ({ page }, testInfo) => {
      await verifyResponsivePage(page, `${userBase}${path}`, testInfo, `customer-${name}`);
      if (expectedPath) expect(new URL(page.url()).pathname).toBe(expectedPath);
    });
  }
});

test('customer home supports keyboard navigation', async ({ page }) => {
  await installMockApiBridge(page, `${userBase}/`);
  await page.goto(`${userBase}/`, { waitUntil: 'domcontentloaded' });
  const skipLink = page.locator('.ds-skip-link');
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('customer public pages expose accessible names and service CTAs', async ({ page }) => {
  await installMockApiBridge(page, `${userBase}/faq`);
  await page.goto(`${userBase}/faq`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('searchbox', { name: 'Tìm trong câu hỏi thường gặp' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Gọi ngay/i })).toBeVisible();

  const unnamedImages = await page.locator('img').evaluateAll((images) =>
    images.filter((image) => !image.hasAttribute('alt')).length,
  );
  expect(unnamedImages).toBe(0);

  await page.goto(`${userBase}/policy/booking`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('DL247-SVC-1.0')).toBeVisible();
  await expect(page.getByText('01/08/2026')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tra cứu yêu cầu' }).first()).toBeVisible();
});

test('admin login remains usable', async ({ page }, testInfo) => {
  await verifyResponsivePage(page, `${adminBase}/login`, testInfo, 'admin-login');
  await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible();
  await expect(page.locator('input[type="password"]').first()).toBeVisible();
});
