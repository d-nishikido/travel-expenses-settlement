import { test as base } from '@playwright/test';
import { LoginPage, DashboardPage, ExpenseReportPage } from '../page-objects';
import { ApiHelper } from '../utils/api-helpers';

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  expenseReportPage: ExpenseReportPage;
  apiHelper: ApiHelper;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  expenseReportPage: async ({ page }, use) => {
    await use(new ExpenseReportPage(page));
  },

  apiHelper: async ({ request }, use) => {
    await use(new ApiHelper(request));
  },
});

export { expect } from '@playwright/test';