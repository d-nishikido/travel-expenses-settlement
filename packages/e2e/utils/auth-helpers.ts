import { Page } from '@playwright/test';
import { LoginPage } from '../page-objects/LoginPage';
import { testUsers } from './test-data';

export async function loginAs(page: Page, userType: 'employee' | 'accounting') {
  const loginPage = new LoginPage(page);
  const user = testUsers[userType];
  
  await loginPage.goto();
  await loginPage.login(user.email, user.password);
  
  // Wait for navigation after successful login
  await page.waitForURL(/\/dashboard/);
}

export async function logout(page: Page) {
  // Check if user menu is visible (user is logged in)
  const userMenu = page.locator('[data-testid="user-menu"]');
  if (await userMenu.isVisible()) {
    await userMenu.click();
    await page.locator('[data-testid="logout-button"]').click();
    await page.waitForURL(/\/login/);
  }
}

export async function ensureLoggedOut(page: Page) {
  try {
    await logout(page);
  } catch {
    // Already logged out
  }
}