import { test, expect } from '../../fixtures/test-fixtures';
import { loginAs } from '../../utils/auth-helpers';
import { generateUniqueReportTitle, getFutureDate, testExpenseReport } from '../../utils/test-data';

test.describe('Submit Expense Report', () => {
  test.beforeEach(async ({ page, expenseReportPage }) => {
    await loginAs(page, 'employee');
    
    // Create a complete report with items
    await expenseReportPage.goto();
    const reportData = {
      title: generateUniqueReportTitle(),
      purpose: 'Complete report for submission',
      startDate: getFutureDate(7),
      endDate: getFutureDate(9)
    };
    
    await expenseReportPage.fillReportDetails(reportData);
    await expenseReportPage.saveReport();
    
    // Add at least one expense item
    await expenseReportPage.addExpenseItem(testExpenseReport.items[0]);
  });

  test('should submit complete expense report', async ({ page, expenseReportPage }) => {
    await expenseReportPage.submitReport();

    // Verify status change
    const statusBadge = page.locator('[data-testid="status-badge"]');
    await expect(statusBadge).toHaveText('Submitted');

    // Verify submit button is disabled/hidden
    const submitButton = expenseReportPage.submitButton();
    await expect(submitButton).not.toBeVisible();
  });

  test('should prevent submission of empty report', async ({ page, expenseReportPage }) => {
    // Create report without items
    await expenseReportPage.goto();
    const reportData = {
      title: generateUniqueReportTitle(),
      purpose: 'Empty report test',
      startDate: getFutureDate(7),
      endDate: getFutureDate(9)
    };
    
    await expenseReportPage.fillReportDetails(reportData);
    await expenseReportPage.saveReport();

    // Try to submit without items
    await expenseReportPage.submitButton().click();

    // Check for validation error
    const errorMessage = page.locator('text=Cannot submit report without expense items');
    await expect(errorMessage).toBeVisible();
  });

  test('should show confirmation dialog before submission', async ({ page, expenseReportPage }) => {
    await expenseReportPage.submitButton().click();

    // Verify confirmation dialog
    const confirmDialog = page.locator('[data-testid="submit-confirmation"]');
    await expect(confirmDialog).toBeVisible();

    const confirmMessage = page.locator('text=Are you sure you want to submit this report?');
    await expect(confirmMessage).toBeVisible();

    // Cancel submission
    const cancelButton = page.locator('[data-testid="cancel-submit"]');
    await cancelButton.click();

    // Verify still in draft status
    const statusBadge = page.locator('[data-testid="status-badge"]');
    await expect(statusBadge).toHaveText('Draft');
  });

  test('should prevent editing after submission', async ({ page, expenseReportPage }) => {
    await expenseReportPage.submitReport();

    // Verify form fields are disabled
    const titleInput = expenseReportPage.titleInput();
    await expect(titleInput).toBeDisabled();

    const purposeInput = expenseReportPage.purposeInput();
    await expect(purposeInput).toBeDisabled();

    // Verify add item button is hidden
    const addItemButton = expenseReportPage.addItemButton();
    await expect(addItemButton).not.toBeVisible();
  });

  test('should update submission timestamp', async ({ page, expenseReportPage }) => {
    await expenseReportPage.submitReport();

    // Verify submission timestamp is displayed
    const submissionTime = page.locator('[data-testid="submitted-at"]');
    await expect(submissionTime).toBeVisible();
    
    // Check that it shows today's date
    const today = new Date().toLocaleDateString();
    await expect(submissionTime).toContainText(today);
  });
});