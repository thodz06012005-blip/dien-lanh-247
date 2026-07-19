import { expect, test } from '@playwright/test';

const userBase = (process.env.PHASE11_USER_URL || 'http://localhost:5173').replace(/\/$/, '');
const adminBase = (process.env.PHASE11_ADMIN_URL || 'http://localhost:5174').replace(/\/$/, '');

async function expectConnectivityRecovery(page, context, url, offlineText, restoredText) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await context.setOffline(true);
  const banner = page.getByTestId('connectivity-banner');
  await expect(banner).toHaveAttribute('data-connectivity-state', 'offline');
  await expect(banner).toContainText(offlineText);
  await context.setOffline(false);
  await expect(banner).toHaveAttribute('data-connectivity-state', 'restored');
  await expect(banner).toContainText(restoredText);
}

test('customer keeps a clear, non-destructive state through network loss', async ({ page, context }) => {
  await expectConnectivityRecovery(
    page,
    context,
    `${userBase}/service-booking`,
    'Thông tin bạn đã nhập vẫn được giữ',
    'Bạn có thể tiếp tục gửi yêu cầu',
  );
});

test('operations portal blocks unsafe work while offline and announces recovery', async ({ page, context }) => {
  await expectConnectivityRecovery(
    page,
    context,
    `${adminBase}/#/login`,
    'Không tiếp tục thao tác điều phối',
    'Dữ liệu đang được đồng bộ lại',
  );
});
