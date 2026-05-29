import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all network requests
  page.on('request', request => {
    const url = request.url();
    if (url.includes('localhost:3001')) {
      console.log(`→ ${request.method()} ${url}`);
      const authHeader = request.headers()['authorization'];
      if (authHeader) {
        console.log('  Auth: PRESENT');
      } else {
        console.log('  Auth: NONE');
      }
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('localhost:3001')) {
      console.log(`← ${response.status()} ${url}`);
    }
  });

  console.log('1. Navigating to login page...');
  await page.goto('http://localhost:5173/admin/login');
  await page.waitForTimeout(2000);

  console.log('2. Filling credentials and submitting...');
  await page.fill('input[name="email"]', 'admin@thichcuu.com');
  await page.fill('input[name="password"]', 'Admin@123456');
  await page.click('button[type="submit"]');

  // Wait longer to see all requests
  await page.waitForTimeout(8000);

  const currentUrl = page.url();
  console.log('\n3. Final URL:', currentUrl);

  const storage = await page.evaluate(() => ({
    token: localStorage.getItem('admin_token'),
    user: localStorage.getItem('admin_user')
  }));
  console.log('4. LocalStorage:', storage.token ? 'HAS TOKEN' : 'NO TOKEN');

  await browser.close();
})();
