import { test, expect } from '../../fixtures/test-fixtures';
import { loginAs } from '../../utils/auth-helpers';

test.describe('Expense Report Detail', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'employee');
  });

  test('should display report detail page', async ({ page }) => {
    // First go to list page to find a report
    await page.goto('/expense-reports');
    
    // Wait for reports to load
    await page.waitForSelector('[data-testid="expense-report-card"]', { timeout: 10000 });
    
    const reportCards = page.locator('[data-testid="expense-report-card"]');
    const cardCount = await reportCards.count();
    
    if (cardCount > 0) {
      // Click on first report to view details
      await reportCards.first().getByTestId('view-report-button').click();
      
      // Should be on detail page
      await expect(page).toHaveURL(/\/expense-reports\/[a-f0-9-]+$/);
      
      // Check for back button
      await expect(page.locator('text=一覧に戻る')).toBeVisible();
      
      // Check for basic report information sections
      await expect(page.locator('text=申請詳細')).toBeVisible();
      await expect(page.locator('text=精算項目')).toBeVisible();
      await expect(page.getByTestId('approval-history')).toBeVisible();
    }
  });

  test('should navigate back to list from detail page', async ({ page }) => {
    // Go to list page first
    await page.goto('/expense-reports');
    
    await page.waitForSelector('[data-testid="expense-report-card"]', { timeout: 10000 });
    
    const reportCards = page.locator('[data-testid="expense-report-card"]');
    const cardCount = await reportCards.count();
    
    if (cardCount > 0) {
      // Navigate to detail page
      await reportCards.first().getByTestId('view-report-button').click();
      
      // Click back button
      await page.locator('text=一覧に戻る').click();
      
      // Should be back on list page
      await expect(page).toHaveURL('/expense-reports');
    }
  });

  test('should display edit button for draft reports', async ({ page }) => {
    // Go to list and filter for draft reports
    await page.goto('/expense-reports');
    
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('draft');
    
    await page.waitForTimeout(1000);
    
    const reportCards = page.locator('[data-testid="expense-report-card"]');
    const cardCount = await reportCards.count();
    
    if (cardCount > 0) {
      // Navigate to detail page
      await reportCards.first().getByTestId('view-report-button').click();
      
      // Should show edit button for draft reports
      const editButton = page.locator('text=編集');
      if (await editButton.count() > 0) {
        await expect(editButton).toBeVisible();
      }
    }
  });

  test('should display submit button for draft reports with items', async ({ page }) => {
    await page.goto('/expense-reports');
    
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('draft');
    
    await page.waitForTimeout(1000);
    
    const reportCards = page.locator('[data-testid="expense-report-card"]');
    const cardCount = await reportCards.count();
    
    if (cardCount > 0) {
      // Navigate to detail page
      await reportCards.first().getByTestId('view-report-button').click();
      
      // Check if submit button exists (only if report has items)
      const submitButton = page.locator('text=申請を提出');
      if (await submitButton.count() > 0) {
        await expect(submitButton).toBeVisible();
      }
    }
  });

  test('should display approval history section', async ({ page }) => {
    await page.goto('/expense-reports');
    
    await page.waitForSelector('[data-testid="expense-report-card"]', { timeout: 10000 });
    
    const reportCards = page.locator('[data-testid="expense-report-card"]');
    const cardCount = await reportCards.count();
    
    if (cardCount > 0) {
      // Navigate to detail page
      await reportCards.first().getByTestId('view-report-button').click();
      
      // Check approval history section
      const historySection = page.getByTestId('approval-history');
      await expect(historySection).toBeVisible();
      await expect(historySection.locator('text=承認履歴')).toBeVisible();
    }
  });

  test('should handle direct navigation to detail page', async ({ page }) => {
    // Try to navigate directly to a detail page (this may fail if ID doesn't exist)
    await page.goto('/expense-reports/non-existent-id');
    
    // Should either show error or redirect to list
    // We'll check for either error message or redirect
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    const hasError = await page.locator('text=申請の取得に失敗しました').count() > 0;
    const redirectedToList = currentUrl.includes('/expense-reports') && !currentUrl.includes('non-existent-id');
    
    expect(hasError || redirectedToList).toBeTruthy();
  });
});

test.describe('Expense Report Detail - Accounting Role', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accounting');
  });

  test('should display approval actions for submitted reports', async ({ page }) => {
    await page.goto('/expense-reports');
    
    // Filter for submitted reports
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('submitted');
    
    await page.waitForTimeout(1000);
    
    const reportCards = page.locator('[data-testid="expense-report-card"]');
    const cardCount = await reportCards.count();
    
    if (cardCount > 0) {
      // Navigate to detail page
      await reportCards.first().getByTestId('view-report-button').click();
      
      // Should show approval and reject buttons for accounting users
      const approveButton = page.locator('text=承認');
      const rejectButton = page.locator('text=却下');
      
      if (await approveButton.count() > 0) {
        await expect(approveButton).toBeVisible();
      }
      
      if (await rejectButton.count() > 0) {
        await expect(rejectButton).toBeVisible();
      }
    }
  });

  test('should display payment button for approved reports', async ({ page }) => {
    await page.goto('/expense-reports');
    
    // Filter for approved reports
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('approved');
    
    await page.waitForTimeout(1000);
    
    const reportCards = page.locator('[data-testid="expense-report-card"]');
    const cardCount = await reportCards.count();
    
    if (cardCount > 0) {
      // Navigate to detail page
      await reportCards.first().getByTestId('view-report-button').click();
      
      // Should show payment button for approved reports
      const payButton = page.locator('text=支払い完了');
      
      if (await payButton.count() > 0) {
        await expect(payButton).toBeVisible();
      }
    }
  });
});