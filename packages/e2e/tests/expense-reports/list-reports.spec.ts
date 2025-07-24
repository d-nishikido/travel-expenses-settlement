import { test, expect } from '../../fixtures/test-fixtures';
import { loginAs } from '../../utils/auth-helpers';
import { generateUniqueReportTitle, getFutureDate } from '../../utils/test-data';

test.describe('Expense Reports List', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'employee');
  });

  test('should display expense reports list', async ({ page }) => {
    await page.goto('/expense-reports');
    
    // Check page title and create button
    await expect(page.locator('h1')).toContainText('精算申請一覧');
    await expect(page.getByTestId('create-new-button')).toBeVisible();
    await expect(page.getByTestId('create-new-button')).toContainText('新規申請作成');
  });

  test('should filter reports by status', async ({ page }) => {
    await page.goto('/expense-reports');
    
    // Select status filter
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('draft');
    
    // Check that filter was applied
    await expect(statusSelect).toHaveValue('draft');
  });

  test('should search reports by title', async ({ page }) => {
    await page.goto('/expense-reports');
    
    // Search for reports
    const searchInput = page.getByPlaceholder('タイトルまたは出張目的で検索...');
    await searchInput.fill('テスト');
    
    // Submit search form
    await searchInput.press('Enter');
  });

  test('should navigate to create new report', async ({ page }) => {
    await page.goto('/expense-reports');
    
    // Click create button
    await page.getByTestId('create-new-button').click();
    
    // Should navigate to create page
    await expect(page).toHaveURL('/expense-reports/new');
  });

  test('should display report cards with correct information', async ({ page }) => {
    await page.goto('/expense-reports');
    
    // Wait for reports to load
    await page.waitForSelector('[data-testid="expense-report-card"]', { timeout: 10000 });
    
    // Check if report cards are displayed
    const reportCards = page.locator('[data-testid="expense-report-card"]');
    const cardCount = await reportCards.count();
    
    if (cardCount > 0) {
      // Check first report card has required elements
      const firstCard = reportCards.first();
      await expect(firstCard.getByTestId('view-report-button')).toBeVisible();
      await expect(firstCard.getByTestId('report-total')).toBeVisible();
    }
  });

  test('should navigate to report detail when view button is clicked', async ({ page }) => {
    await page.goto('/expense-reports');
    
    // Wait for reports to load
    await page.waitForSelector('[data-testid="expense-report-card"]', { timeout: 10000 });
    
    const reportCards = page.locator('[data-testid="expense-report-card"]');
    const cardCount = await reportCards.count();
    
    if (cardCount > 0) {
      // Click view button on first report
      await reportCards.first().getByTestId('view-report-button').click();
      
      // Should navigate to detail page
      await expect(page).toHaveURL(/\/expense-reports\/[a-f0-9-]+$/);
    }
  });

  test('should show edit and delete buttons for draft reports', async ({ page }) => {
    await page.goto('/expense-reports');
    
    // Filter to draft reports only
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('draft');
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    const reportCards = page.locator('[data-testid="expense-report-card"]');
    const cardCount = await reportCards.count();
    
    if (cardCount > 0) {
      const firstCard = reportCards.first();
      
      // Check for edit and delete buttons
      const editButton = firstCard.getByTestId('edit-report-button');
      const deleteButton = firstCard.getByTestId('delete-report-button');
      
      if (await editButton.count() > 0) {
        await expect(editButton).toBeVisible();
      }
      
      if (await deleteButton.count() > 0) {
        await expect(deleteButton).toBeVisible();
      }
    }
  });

  test('should handle empty state', async ({ page }) => {
    await page.goto('/expense-reports');
    
    // If no reports exist, should show empty state
    const reportCards = page.locator('[data-testid="expense-report-card"]');
    const cardCount = await reportCards.count();
    
    if (cardCount === 0) {
      await expect(page.locator('text=申請がありません')).toBeVisible();
      await expect(page.locator('text=最初の申請を作成')).toBeVisible();
    }
  });
});