import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Basic Login Debug', () => {
  test('should access login page', async ({ page }) => {
    await page.goto('/');
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'debug-homepage.png' });
    
    // Check if we're redirected to login or dashboard
    console.log('Current URL:', page.url());
    
    // Wait a moment to see what happens
    await page.waitForTimeout(2000);
    
    console.log('URL after wait:', page.url());
  });

  test('should manually login with test user', async ({ page }) => {
    await page.goto('/login');
    
    // Wait for the form to be loaded
    await page.waitForSelector('#email', { timeout: 10000 });
    
    // Take screenshot
    await page.screenshot({ path: 'debug-login-page.png' });
    
    // Fill login form using ID selectors
    await page.fill('#email', 'employee1@example.com');
    await page.fill('#password', 'password');
    
    // Take screenshot before submit
    await page.screenshot({ path: 'debug-before-submit.png' });
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation or error
    try {
      await page.waitForURL(/\/dashboard/, { timeout: 10000 });
      console.log('Successfully logged in! URL:', page.url());
    } catch (error) {
      console.log('Login failed or timeout. Current URL:', page.url());
      
      // Check for error messages
      const errorMessage = await page.locator('.text-red-600').textContent();
      if (errorMessage) {
        console.log('Error message:', errorMessage);
      }
    }
    
    // Take screenshot after submit
    await page.screenshot({ path: 'debug-after-submit.png' });
  });
});