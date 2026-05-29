import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. Login...');
  await page.goto('http://localhost:5173/admin/login');
  await page.fill('input[name="email"]', 'admin@thichcuu.com');
  await page.fill('input[name="password"]', 'Admin@123456');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForTimeout(2000);

  console.log('2. Taking dashboard screenshot...');
  await page.screenshot({ path: 'dashboard-success.png', fullPage: true });

  const url = page.url();
  console.log('✅ SUCCESS - Current URL:', url);

  await page.waitForTimeout(2000);
  await browser.close();
})();
