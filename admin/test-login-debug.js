import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture console logs
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  // Capture network requests
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('auth/login')) {
      console.log('→ REQUEST:', request.method(), request.url());
      console.log('  Headers:', JSON.stringify(request.headers(), null, 2));
      console.log('  Body:', request.postData());
    }
  });

  page.on('response', async response => {
    if (response.url().includes('auth/login')) {
      console.log('← RESPONSE:', response.status(), response.url());
      console.log('  Headers:', JSON.stringify(response.headers(), null, 2));
      try {
        const body = await response.text();
        console.log('  Body:', body);
      } catch (e) {
        console.log('  Body: (could not read)');
      }
    }
  });

  console.log('1. Navigating to login page...');
  await page.goto('http://localhost:5175/login');
  await page.waitForTimeout(2000);

  console.log('2. Filling in credentials...');
  await page.fill('input[name="email"]', 'admin@thichcuu.com');
  await page.fill('input[name="password"]', 'Admin@123456');

  console.log('3. Clicking login button...');
  await page.click('button[type="submit"]');

  // Wait for network activity
  await page.waitForTimeout(5000);

  const currentUrl = page.url();
  console.log('4. Current URL:', currentUrl);

  // Check Redux state
  const reduxState = await page.evaluate(() => {
    return window.__REDUX_DEVTOOLS_EXTENSION__ ?
      'Redux DevTools available' :
      'Redux DevTools not available';
  });
  console.log('Redux:', reduxState);

  // Check localStorage
  const storage = await page.evaluate(() => {
    return {
      token: localStorage.getItem('admin_token'),
      user: localStorage.getItem('admin_user')
    };
  });
  console.log('LocalStorage:', storage);

  await page.waitForTimeout(2000);
  await browser.close();
})();
