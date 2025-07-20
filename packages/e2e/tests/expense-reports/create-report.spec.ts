import { test, expect } from '../../fixtures/test-fixtures';
import { loginAs } from '../../utils/auth-helpers';
import { generateUniqueReportTitle, getFutureDate } from '../../utils/test-data';

test.describe('Create Expense Report', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'employee');
  });

  test('should create a new expense report', async ({ page, dashboardPage, expenseReportPage }) => {
    await dashboardPage.goto();
    await dashboardPage.navigateToCreateExpense();

    const reportData = {
      title: generateUniqueReportTitle(),
      purpose: 'Client meeting in San Francisco',
      startDate: getFutureDate(7),
      endDate: getFutureDate(9)
    };

    await expenseReportPage.fillReportDetails(reportData);
    await expenseReportPage.saveReport();

    // Verify success message or redirect
    await expect(page).toHaveURL(/\/expense-reports\/[a-f0-9-]+/);
  });

  test('should validate required fields', async ({ expenseReportPage }) => {
    await expenseReportPage.goto();
    
    // Try to save without filling required fields
    await expenseReportPage.saveButton().click();

    // Check for validation errors
    const titleError = page.locator('text=Title is required');
    await expect(titleError).toBeVisible();
  });

  test('should save as draft', async ({ page, expenseReportPage }) => {
    await expenseReportPage.goto();

    const reportData = {
      title: generateUniqueReportTitle(),
      purpose: 'Draft report for testing',
      startDate: getFutureDate(10),
      endDate: getFutureDate(12)
    };

    await expenseReportPage.fillReportDetails(reportData);
    await expenseReportPage.saveReport();

    // Verify draft status
    const statusBadge = page.locator('[data-testid="status-badge"]');
    await expect(statusBadge).toHaveText('Draft');
  });

  test('should prevent end date before start date', async ({ expenseReportPage }) => {
    await expenseReportPage.goto();

    const reportData = {
      title: generateUniqueReportTitle(),
      purpose: 'Date validation test',
      startDate: getFutureDate(10),
      endDate: getFutureDate(5) // End date before start date
    };

    await expenseReportPage.fillReportDetails(reportData);
    await expenseReportPage.saveReport();

    // Check for date validation error
    const dateError = page.locator('text=End date must be after start date');
    await expect(dateError).toBeVisible();
  });
});