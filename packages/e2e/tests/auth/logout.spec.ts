import { test, expect } from '../../fixtures/test-fixtures';
import { loginAs } from '../../utils/auth-helpers';

test.describe('Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'employee');
  });

  test('should logout successfully', async ({ page, dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.logout();

    // Verify redirect to login page
    await expect(page).toHaveURL(/\/login/);

    // Verify cannot access protected routes after logout
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should clear session on logout', async ({ page, dashboardPage }) => {
    await dashboardPage.goto();
    await dashboardPage.logout();

    // Try to navigate back
    await page.goBack();
    
    // Should still be on login page
    await expect(page).toHaveURL(/\/login/);
  });
});