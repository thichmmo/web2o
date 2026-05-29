import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('1. Navigating to login page...');
  await page.goto('http://localhost:5173/admin/login');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshot-1-login-page.png' });

  console.log('2. Filling in credentials...');
  await page.fill('input[name="email"]', 'admin@thichcuu.com');
  await page.fill('input[name="password"]', 'Admin@123456');
  await page.screenshot({ path: 'screenshot-2-filled-form.png' });

  console.log('3. Clicking login button...');
  await page.click('button[type="submit"]');

  // Wait for navigation or error
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  console.log('4. Current URL after login:', currentUrl);
  await page.screenshot({ path: 'screenshot-3-after-login.png' });

  // Check if redirected to dashboard
  if (currentUrl.includes('/dashboard')) {
    console.log('✅ SUCCESS: Redirected to dashboard');

    // Check if dashboard content loaded
    const dashboardTitle = await page.textContent('h1, h2').catch(() => null);
    console.log('Dashboard title:', dashboardTitle);

  } else if (currentUrl.includes('/login')) {
    console.log('❌ FAIL: Still on login page');

    // Check for error message
    const errorMsg = await page.textContent('.text-red-800, .text-red-600, [class*="error"]').catch(() => null);
    console.log('Error message:', errorMsg);

    // Check localStorage
    const token = await page.evaluate(() => localStorage.getItem('admin_token'));
    const user = await page.evaluate(() => localStorage.getItem('admin_user'));
    console.log('Token in localStorage:', token ? 'EXISTS' : 'NULL');
    console.log('User in localStorage:', user ? 'EXISTS' : 'NULL');

    // Check network requests
    console.log('\nChecking console logs...');
  } else {
    console.log('⚠️  UNEXPECTED: Redirected to', currentUrl);
  }

  await page.waitForTimeout(2000);
  await browser.close();
})();
