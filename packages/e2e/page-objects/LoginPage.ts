import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput = () => this.page.locator('input[type="email"]');
  readonly passwordInput = () => this.page.locator('input[type="password"]');
  readonly loginButton = () => this.page.locator('button[type="submit"]');
  readonly errorMessage = () => this.page.locator('[role="alert"]');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/login');
  }

  async login(email: string, password: string) {
    await this.fillInput(this.emailInput(), email);
    await this.fillInput(this.passwordInput(), password);
    await this.clickElement(this.loginButton());
  }

  async getErrorMessage(): Promise<string> {
    return await this.getElementText(this.errorMessage());
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage());
  }
}