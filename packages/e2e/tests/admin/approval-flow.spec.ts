import { test, expect } from '../../fixtures/test-fixtures';
import { loginAs } from '../../utils/auth-helpers';
import { generateUniqueReportTitle, getFutureDate, testExpenseReport } from '../../utils/test-data';

test.describe('Expense Report Approval Flow', () => {
  let reportId: string;

  test.beforeEach(async ({ page, expenseReportPage, apiHelper }) => {
    // Create and submit a report as employee
    await loginAs(page, 'employee');
    await expenseReportPage.goto();
    
    const reportData = {
      title: generateUniqueReportTitle(),
      purpose: 'Report for approval testing',
      startDate: getFutureDate(7),
      endDate: getFutureDate(9)
    };
    
    await expenseReportPage.fillReportDetails(reportData);
    await expenseReportPage.saveReport();
    await expenseReportPage.addExpenseItem(testExpenseReport.items[0]);
    await expenseReportPage.submitReport();
    
    // Get report ID from URL
    const url = page.url();
    reportId = url.split('/').pop() || '';
    
    // Switch to accounting user
    await loginAs(page, 'accounting');
  });

  test('should approve expense report', async ({ page }) => {
    await page.goto(`/admin/expense-reports/${reportId}`);

    // Click approve button
    const approveButton = page.locator('[data-testid="approve-button"]');
    await approveButton.click();

    // Add approval comment
    const commentInput = page.locator('[data-testid="approval-comment"]');
    await commentInput.fill('Approved - all expenses are reasonable');

    // Confirm approval
    const confirmButton = page.locator('[data-testid="confirm-approval"]');
    await confirmButton.click();

    // Verify status change
    const statusBadge = page.locator('[data-testid="status-badge"]');
    await expect(statusBadge).toHaveText('Approved');

    // Verify approval history
    const approvalHistory = page.locator('[data-testid="approval-history"]');
    await expect(approvalHistory).toContainText('Approved by Test Accounting');
  });

  test('should reject expense report', async ({ page }) => {
    await page.goto(`/admin/expense-reports/${reportId}`);

    // Click reject button
    const rejectButton = page.locator('[data-testid="reject-button"]');
    await rejectButton.click();

    // Add rejection comment (required)
    const commentInput = page.locator('[data-testid="rejection-comment"]');
    await commentInput.fill('Missing receipts for transportation expenses');

    // Confirm rejection
    const confirmButton = page.locator('[data-testid="confirm-rejection"]');
    await confirmButton.click();

    // Verify status change
    const statusBadge = page.locator('[data-testid="status-badge"]');
    await expect(statusBadge).toHaveText('Rejected');

    // Verify rejection history
    const approvalHistory = page.locator('[data-testid="approval-history"]');
    await expect(approvalHistory).toContainText('Rejected by Test Accounting');
    await expect(approvalHistory).toContainText('Missing receipts');
  });

  test('should require comment for rejection', async ({ page }) => {
    await page.goto(`/admin/expense-reports/${reportId}`);

    const rejectButton = page.locator('[data-testid="reject-button"]');
    await rejectButton.click();

    // Try to reject without comment
    const confirmButton = page.locator('[data-testid="confirm-rejection"]');
    await confirmButton.click();

    // Verify error message
    const errorMessage = page.locator('text=Comment is required for rejection');
    await expect(errorMessage).toBeVisible();
  });

  test('should mark report as paid after approval', async ({ page }) => {
    // First approve the report
    await page.goto(`/admin/expense-reports/${reportId}`);
    const approveButton = page.locator('[data-testid="approve-button"]');
    await approveButton.click();
    
    const commentInput = page.locator('[data-testid="approval-comment"]');
    await commentInput.fill('Approved for payment');
    
    const confirmButton = page.locator('[data-testid="confirm-approval"]');
    await confirmButton.click();

    // Wait for approval to complete
    await expect(page.locator('[data-testid="status-badge"]')).toHaveText('Approved');

    // Mark as paid
    const payButton = page.locator('[data-testid="mark-paid-button"]');
    await payButton.click();

    const paymentComment = page.locator('[data-testid="payment-comment"]');
    await paymentComment.fill('Payment processed via bank transfer');

    const confirmPayment = page.locator('[data-testid="confirm-payment"]');
    await confirmPayment.click();

    // Verify status change
    const statusBadge = page.locator('[data-testid="status-badge"]');
    await expect(statusBadge).toHaveText('Paid');
  });
});