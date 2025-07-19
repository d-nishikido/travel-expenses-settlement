import { test, expect } from '../../fixtures/test-fixtures';
import { testUsers } from '../../utils/test-data';
import { ensureLoggedOut } from '../../utils/auth-helpers';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedOut(page);
  });

  test('should login successfully with valid employee credentials', async ({ page, loginPage, dashboardPage }) => {
    await loginPage.goto();
    await loginPage.login(testUsers.employee.email, testUsers.employee.password);

    // Verify successful login
    await expect(page).toHaveURL(/\/dashboard/);
    await dashboardPage.waitForDashboardLoad();
    
    const welcomeMessage = await dashboardPage.getWelcomeMessage();
    expect(welcomeMessage).toContain('Dashboard');
  });

  test('should login successfully with valid accounting credentials', async ({ page, loginPage, dashboardPage }) => {
    await loginPage.goto();
    await loginPage.login(testUsers.accounting.email, testUsers.accounting.password);

    // Verify successful login
    await expect(page).toHaveURL(/\/dashboard/);
    await dashboardPage.waitForDashboardLoad();
  });

  test('should show error message with invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'wrongpassword');

    // Verify error message is displayed
    const isErrorVisible = await loginPage.isErrorMessageVisible();
    expect(isErrorVisible).toBeTruthy();

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });

  test('should show error message with empty fields', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.clickElement(loginPage.loginButton());

    // Verify validation errors
    const isErrorVisible = await loginPage.isErrorMessageVisible();
    expect(isErrorVisible).toBeTruthy();
  });

  test('should redirect to login page when accessing protected route without auth', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});