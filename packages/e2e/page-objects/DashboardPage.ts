import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly userMenu = () => this.page.locator('[data-testid="user-menu"]');
  readonly logoutButton = () => this.page.locator('[data-testid="logout-button"]');
  readonly createExpenseButton = () => this.page.locator('[data-testid="create-expense-button"]');
  readonly expenseReportsList = () => this.page.locator('[data-testid="expense-reports-list"]');
  readonly welcomeMessage = () => this.page.locator('h1');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/dashboard');
  }

  async logout() {
    await this.clickElement(this.userMenu());
    await this.clickElement(this.logoutButton());
  }

  async navigateToCreateExpense() {
    await this.clickElement(this.createExpenseButton());
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.getElementText(this.welcomeMessage());
  }

  async waitForDashboardLoad() {
    await this.waitForElement(this.welcomeMessage());
    await this.waitForPageLoad();
  }
}