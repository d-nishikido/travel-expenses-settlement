import { test, expect } from '../../fixtures/test-fixtures';
import { loginAs } from '../../utils/auth-helpers';

test.describe('Session Management', () => {
  test('should maintain session across page navigations', async ({ page }) => {
    await loginAs(page, 'employee');

    // Navigate to different pages
    await page.goto('/expense-reports');
    await expect(page).toHaveURL(/\/expense-reports/);

    await page.goto('/profile');
    await expect(page).toHaveURL(/\/profile/);

    // Should still be logged in
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible();
  });

  test('should maintain session after page refresh', async ({ page, dashboardPage }) => {
    await loginAs(page, 'employee');
    await dashboardPage.goto();

    // Refresh the page
    await page.reload();

    // Should still be on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await dashboardPage.waitForDashboardLoad();
  });

  test('should handle session timeout gracefully', async ({ page }) => {
    await loginAs(page, 'employee');

    // Simulate session expiry by clearing cookies
    await page.context().clearCookies();

    // Try to navigate to protected route
    await page.goto('/expense-reports');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});