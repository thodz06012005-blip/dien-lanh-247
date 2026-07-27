import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const source = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');

const deletedCommerceSources = [
  'frontend-user/src/pages/Products.tsx',
  'frontend-user/src/pages/ProductDetail.tsx',
  'frontend-user/src/pages/Cart.tsx',
  'frontend-user/src/pages/Checkout.tsx',
  'frontend-user/src/pages/Orders.tsx',
  'frontend-user/src/components/product/ProductCard.tsx',
  'frontend-user/src/components/cart/MiniCart.tsx',
  'frontend-user/src/components/checkout/OrderSummary.tsx',
  'frontend-user/src/components/home/CategoryCard.tsx',
  'frontend-user/src/components/home/HeroBanner.tsx',
  'frontend-user/src/components/layout/MobileMenu.tsx',
  'frontend-user/src/store/cartStore.ts',
  'frontend-user/src/mock/data.ts',
];

test('customer commerce pages, stores and product-only types are absent', () => {
  for (const relativePath of deletedCommerceSources) {
    assert.equal(existsSync(path.join(root, relativePath)), false, relativePath);
  }
});

test('legacy customer commerce URLs redirect without lazy-loading commerce code', () => {
  const router = source('frontend-user/src/router/AppRouter.tsx');
  for (const route of ['products/*', 'cart', 'checkout', 'orders/*']) {
    assert.match(router, new RegExp(`path="${route.replace('*', '\\*')}"`));
  }
  assert.match(router, /products\/\*" element={<Navigate to="\/services"/);
  assert.match(router, /cart" element={<Navigate to="\/service-booking"/);
  assert.match(router, /orders\/\*" element={<Navigate to="\/account\?tab=services"/);
  assert.doesNotMatch(router, /pages\/(?:Products|ProductDetail|Cart|Checkout|Orders)/);

  const nginx = source('frontend-user/nginx.conf');
  const redirects = source('frontend-user/public/_redirects');
  assert.match(nginx, /location \^~ \/products\//);
  assert.match(nginx, /return 301 \/service-booking/);
  assert.match(redirects, /\/products\/\*\s+\/services\s+301!/);
  assert.match(redirects, /\/policy\/returns\s+\/policy\/warranty\s+301!/);
});

test('navigation, footer and CMS content cannot expose retired links', () => {
  const header = source('frontend-user/src/components/layout/Header.tsx');
  const footer = source('frontend-user/src/components/layout/Footer.tsx');
  const cms = source('frontend-user/src/components/cms/CmsManagedHomepage.tsx');
  assert.doesNotMatch(header, /ShoppingCart|cartStore|to: '\/products'/);
  assert.doesNotMatch(footer, /label: 'Sản phẩm'|to="\/orders"|Giao nhận & lắp đặt|Đổi trả/);
  assert.match(footer, /selected\.filter/);
  assert.match(cms, /serviceOnlyHref/);
  assert.match(cms, /sanitizeManagedHtml/);
});

test('Account Hub has exactly six service-oriented tabs and no order query', () => {
  const account = source('frontend-user/src/pages/Account.tsx');
  const tabIds = [...account.matchAll(/\{ id: '([^']+)', label:/g)].map((match) => match[1]);
  assert.deepEqual(tabIds, ['overview', 'profile', 'addresses', 'services', 'notifications', 'security']);
  assert.doesNotMatch(account, /listAccountOrders|ordersQuery|OrdersTab|AccountOrder|tab: 'orders'/);
  assert.match(account, /Ghi chú phục vụ/);
});

test('home presents services, reference pricing, process and projects', () => {
  const home = source('frontend-user/src/pages/Home.tsx');
  const cms = source('frontend-user/src/components/cms/CmsManagedHomepage.tsx');
  const pricing = source('frontend-user/src/components/home/PricingTable.tsx');
  for (const marker of ['Dịch vụ nổi bật', '<PricingTable />', 'Quy trình phục vụ', '<CmsManagedHomepage />']) {
    assert.ok(home.includes(marker), marker);
  }
  assert.match(cms, /Dự án tiêu biểu đã xác minh/);
  assert.match(cms, /projects\.length > 0/);
  assert.match(pricing, /Bảng giá tham khảo/);
  assert.match(pricing, /báo giá chính xác trước khi sửa/);
  assert.doesNotMatch(pricing, /<Link[^>]*>\s*<button/);
});

test('public discovery files and bundle verification exclude commerce surfaces', () => {
  const sitemapGenerator = source('frontend-user/scripts/generate-sitemap.mjs');
  const seo = source('frontend-user/src/seo/SeoManager.tsx');
  const verifier = source('scripts/verify-customer-service-only-bundle.mjs');
  assert.doesNotMatch(sitemapGenerator, /endpoint: '\/products'|path: '\/products'/);
  assert.doesNotMatch(seo, /ProductSeoRecord|@type': 'Product'|productQuery/);
  assert.match(verifier, /dl247_cart_items/);
  assert.match(source('package.json'), /verify-customer-service-only-bundle/);
});
