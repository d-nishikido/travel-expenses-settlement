import { test, expect } from '../../fixtures/test-fixtures';
import { loginAs } from '../../utils/auth-helpers';
import { generateUniqueReportTitle, getFutureDate, testExpenseReport } from '../../utils/test-data';

test.describe('Expense Items Management', () => {
  test.beforeEach(async ({ page, expenseReportPage }) => {
    await loginAs(page, 'employee');
    
    // Create a base report first
    await expenseReportPage.goto();
    const reportData = {
      title: generateUniqueReportTitle(),
      purpose: 'Test report for items',
      startDate: getFutureDate(7),
      endDate: getFutureDate(9)
    };
    
    await expenseReportPage.fillReportDetails(reportData);
    await expenseReportPage.saveReport();
  });

  test('should add expense items to report', async ({ page, expenseReportPage }) => {
    const item = testExpenseReport.items[0];
    
    await expenseReportPage.addExpenseItem(item);

    // Verify item was added
    const itemRow = page.locator(`[data-testid="expense-item"]:has-text("${item.description}")`);
    await expect(itemRow).toBeVisible();

    // Verify amount is displayed correctly
    const amountCell = itemRow.locator('[data-testid="item-amount"]');
    await expect(amountCell).toHaveText(`$${item.amount}`);
  });

  test('should add multiple expense items', async ({ page, expenseReportPage }) => {
    // Add all test items
    for (const item of testExpenseReport.items) {
      await expenseReportPage.addExpenseItem(item);
    }

    // Verify all items are present
    for (const item of testExpenseReport.items) {
      const itemRow = page.locator(`[data-testid="expense-item"]:has-text("${item.description}")`);
      await expect(itemRow).toBeVisible();
    }

    // Verify total amount calculation
    const totalAmount = page.locator('[data-testid="total-amount"]');
    const expectedTotal = testExpenseReport.items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    await expect(totalAmount).toHaveText(`$${expectedTotal.toFixed(2)}`);
  });

  test('should validate expense item fields', async ({ expenseReportPage }) => {
    // Try to add item without required fields
    await expenseReportPage.addItemButton().click();
    await expenseReportPage.itemSaveButton().click();

    // Check for validation errors
    const categoryError = page.locator('text=Category is required');
    await expect(categoryError).toBeVisible();

    const descriptionError = page.locator('text=Description is required');
    await expect(descriptionError).toBeVisible();

    const amountError = page.locator('text=Amount is required');
    await expect(amountError).toBeVisible();
  });

  test('should edit expense item', async ({ page, expenseReportPage }) => {
    const item = testExpenseReport.items[0];
    
    // Add initial item
    await expenseReportPage.addExpenseItem(item);

    // Edit the item
    const editButton = page.locator('[data-testid="edit-item-button"]').first();
    await editButton.click();

    const updatedDescription = 'Updated flight tickets';
    await expenseReportPage.fillInput(expenseReportPage.itemDescriptionInput(), updatedDescription);
    await expenseReportPage.itemSaveButton().click();

    // Verify item was updated
    const itemRow = page.locator(`[data-testid="expense-item"]:has-text("${updatedDescription}")`);
    await expect(itemRow).toBeVisible();
  });

  test('should delete expense item', async ({ page, expenseReportPage }) => {
    const item = testExpenseReport.items[0];
    
    // Add item
    await expenseReportPage.addExpenseItem(item);

    // Delete the item
    const deleteButton = page.locator('[data-testid="delete-item-button"]').first();
    await deleteButton.click();

    // Confirm deletion
    const confirmButton = page.locator('[data-testid="confirm-delete"]');
    await confirmButton.click();

    // Verify item was removed
    const itemRow = page.locator(`[data-testid="expense-item"]:has-text("${item.description}")`);
    await expect(itemRow).not.toBeVisible();
  });
});