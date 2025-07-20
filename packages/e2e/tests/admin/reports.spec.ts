import { test, expect } from '../../fixtures/test-fixtures';
import { loginAs } from '../../utils/auth-helpers';

test.describe('Admin Reports and Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accounting');
  });

  test('should view expense reports dashboard', async ({ page }) => {
    await page.goto('/admin/reports');

    // Verify dashboard widgets
    const totalPendingWidget = page.locator('[data-testid="total-pending-reports"]');
    await expect(totalPendingWidget).toBeVisible();

    const totalAmountWidget = page.locator('[data-testid="total-amount-pending"]');
    await expect(totalAmountWidget).toBeVisible();

    const monthlyTrendWidget = page.locator('[data-testid="monthly-trend-chart"]');
    await expect(monthlyTrendWidget).toBeVisible();
  });

  test('should filter reports by status', async ({ page }) => {
    await page.goto('/admin/reports');

    // Filter by submitted status
    const statusFilter = page.locator('[data-testid="status-filter"]');
    await statusFilter.selectOption('submitted');

    const applyFilter = page.locator('[data-testid="apply-filter"]');
    await applyFilter.click();

    // Verify only submitted reports are shown
    const reportRows = page.locator('[data-testid="report-row"]');
    const count = await reportRows.count();
    
    for (let i = 0; i < count; i++) {
      const statusBadge = reportRows.nth(i).locator('[data-testid="status-badge"]');
      await expect(statusBadge).toHaveText('Submitted');
    }
  });

  test('should filter reports by date range', async ({ page }) => {
    await page.goto('/admin/reports');

    // Set date range filter
    const startDate = page.locator('[data-testid="start-date-filter"]');
    const endDate = page.locator('[data-testid="end-date-filter"]');

    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    await startDate.fill(lastMonth.toISOString().split('T')[0]);
    await endDate.fill(today.toISOString().split('T')[0]);

    const applyFilter = page.locator('[data-testid="apply-filter"]');
    await applyFilter.click();

    // Verify reports are within date range
    const reportDates = page.locator('[data-testid="report-date"]');
    const count = await reportDates.count();
    
    for (let i = 0; i < count; i++) {
      const dateText = await reportDates.nth(i).textContent();
      const reportDate = new Date(dateText || '');
      expect(reportDate >= lastMonth && reportDate <= today).toBeTruthy();
    }
  });

  test('should export reports to CSV', async ({ page }) => {
    await page.goto('/admin/reports');

    // Start download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('[data-testid="export-csv"]').click()
    ]);

    // Verify download
    expect(download.suggestedFilename()).toContain('expense-reports');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should view detailed report analytics', async ({ page }) => {
    await page.goto('/admin/analytics');

    // Verify analytics charts
    const categoryChart = page.locator('[data-testid="expenses-by-category-chart"]');
    await expect(categoryChart).toBeVisible();

    const departmentChart = page.locator('[data-testid="expenses-by-department-chart"]');
    await expect(departmentChart).toBeVisible();

    const timelineChart = page.locator('[data-testid="expenses-timeline-chart"]');
    await expect(timelineChart).toBeVisible();
  });

  test('should view summary statistics', async ({ page }) => {
    await page.goto('/admin/reports');

    // Verify summary cards
    const summaryCards = [
      'total-reports-submitted',
      'total-amount-approved',
      'average-processing-time',
      'pending-approvals-count'
    ];

    for (const cardId of summaryCards) {
      const card = page.locator(`[data-testid="${cardId}"]`);
      await expect(card).toBeVisible();
      
      // Verify card has numeric value
      const value = await card.locator('.summary-value').textContent();
      expect(value).toMatch(/[\d,.$]+/);
    }
  });

  test('should navigate to individual report from list', async ({ page }) => {
    await page.goto('/admin/reports');

    // Click on first report in list
    const firstReport = page.locator('[data-testid="report-row"]').first();
    const reportTitle = await firstReport.locator('[data-testid="report-title"]').textContent();
    
    await firstReport.click();

    // Verify navigation to report detail
    await expect(page).toHaveURL(/\/admin\/expense-reports\/[a-f0-9-]+/);
    
    // Verify report title matches
    const detailTitle = page.locator('h1');
    await expect(detailTitle).toHaveText(reportTitle || '');
  });
});