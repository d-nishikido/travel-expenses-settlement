import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ExpenseReportPage extends BasePage {
  readonly titleInput = () => this.page.locator('input[name="title"]');
  readonly purposeInput = () => this.page.locator('textarea[name="tripPurpose"]');
  readonly startDateInput = () => this.page.locator('input[name="tripStartDate"]');
  readonly endDateInput = () => this.page.locator('input[name="tripEndDate"]');
  readonly saveButton = () => this.page.locator('button[type="submit"]');
  readonly submitButton = () => this.page.locator('[data-testid="submit-button"]');
  readonly addItemButton = () => this.page.locator('[data-testid="add-item-button"]');
  
  // Expense item fields
  readonly itemCategorySelect = () => this.page.locator('select[name="category"]');
  readonly itemDescriptionInput = () => this.page.locator('input[name="description"]');
  readonly itemAmountInput = () => this.page.locator('input[name="amount"]');
  readonly itemDateInput = () => this.page.locator('input[name="expenseDate"]');
  readonly itemSaveButton = () => this.page.locator('[data-testid="save-item-button"]');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await this.navigate('/expense-reports/new');
  }

  async fillReportDetails(data: {
    title: string;
    purpose: string;
    startDate: string;
    endDate: string;
  }) {
    await this.fillInput(this.titleInput(), data.title);
    await this.fillInput(this.purposeInput(), data.purpose);
    await this.fillInput(this.startDateInput(), data.startDate);
    await this.fillInput(this.endDateInput(), data.endDate);
  }

  async saveReport() {
    await this.clickElement(this.saveButton());
  }

  async submitReport() {
    await this.clickElement(this.submitButton());
  }

  async addExpenseItem(data: {
    category: string;
    description: string;
    amount: string;
    date: string;
  }) {
    await this.clickElement(this.addItemButton());
    await this.selectOption(this.itemCategorySelect(), data.category);
    await this.fillInput(this.itemDescriptionInput(), data.description);
    await this.fillInput(this.itemAmountInput(), data.amount);
    await this.fillInput(this.itemDateInput(), data.date);
    await this.clickElement(this.itemSaveButton());
  }
}