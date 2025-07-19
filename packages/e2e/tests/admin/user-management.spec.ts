import { test, expect } from '../../fixtures/test-fixtures';
import { loginAs } from '../../utils/auth-helpers';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'accounting');
  });

  test('should view all users', async ({ page }) => {
    await page.goto('/admin/users');

    // Verify users table is visible
    const usersTable = page.locator('[data-testid="users-table"]');
    await expect(usersTable).toBeVisible();

    // Verify table headers
    const headers = ['Name', 'Email', 'Role', 'Department', 'Actions'];
    for (const header of headers) {
      await expect(page.locator(`th:has-text("${header}")`)).toBeVisible();
    }

    // Verify test users are present
    await expect(page.locator('text=test.employee@example.com')).toBeVisible();
    await expect(page.locator('text=test.accounting@example.com')).toBeVisible();
  });

  test('should create new user', async ({ page }) => {
    await page.goto('/admin/users');

    // Click create user button
    const createButton = page.locator('[data-testid="create-user-button"]');
    await createButton.click();

    // Fill user form
    const newUser = {
      name: 'Test Manager',
      email: `test.manager.${Date.now()}@example.com`,
      role: 'employee',
      department: 'Marketing'
    };

    await page.locator('input[name="name"]').fill(newUser.name);
    await page.locator('input[name="email"]').fill(newUser.email);
    await page.locator('select[name="role"]').selectOption(newUser.role);
    await page.locator('input[name="department"]').fill(newUser.department);
    
    // Set temporary password
    await page.locator('input[name="password"]').fill('TempPassword123!');

    // Submit form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Verify user was created
    await expect(page.locator(`text=${newUser.email}`)).toBeVisible();
    await expect(page.locator(`text=${newUser.name}`)).toBeVisible();
  });

  test('should validate user creation form', async ({ page }) => {
    await page.goto('/admin/users');

    const createButton = page.locator('[data-testid="create-user-button"]');
    await createButton.click();

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Verify validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should edit user information', async ({ page }) => {
    await page.goto('/admin/users');

    // Find and click edit button for test employee
    const editButton = page.locator('[data-testid="edit-user-button"]').first();
    await editButton.click();

    // Update department
    const departmentInput = page.locator('input[name="department"]');
    await departmentInput.clear();
    await departmentInput.fill('Updated Department');

    // Save changes
    const saveButton = page.locator('button[type="submit"]');
    await saveButton.click();

    // Verify update
    await expect(page.locator('text=Updated Department')).toBeVisible();
  });

  test('should delete user with confirmation', async ({ page, apiHelper }) => {
    await page.goto('/admin/users');

    // Create a test user to delete
    const testUser = {
      name: 'User To Delete',
      email: `delete.test.${Date.now()}@example.com`,
      role: 'employee',
      department: 'Test'
    };

    const createButton = page.locator('[data-testid="create-user-button"]');
    await createButton.click();

    await page.locator('input[name="name"]').fill(testUser.name);
    await page.locator('input[name="email"]').fill(testUser.email);
    await page.locator('select[name="role"]').selectOption(testUser.role);
    await page.locator('input[name="department"]').fill(testUser.department);
    await page.locator('input[name="password"]').fill('TempPassword123!');

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Now delete the user
    const userRow = page.locator(`tr:has-text("${testUser.email}")`);
    const deleteButton = userRow.locator('[data-testid="delete-user-button"]');
    await deleteButton.click();

    // Confirm deletion
    const confirmDialog = page.locator('[data-testid="delete-confirmation"]');
    await expect(confirmDialog).toBeVisible();
    
    const confirmButton = page.locator('[data-testid="confirm-delete"]');
    await confirmButton.click();

    // Verify user was deleted
    await expect(page.locator(`text=${testUser.email}`)).not.toBeVisible();
  });

  test('should filter users by role', async ({ page }) => {
    await page.goto('/admin/users');

    // Filter by employee role
    const roleFilter = page.locator('[data-testid="role-filter"]');
    await roleFilter.selectOption('employee');

    // Verify only employees are shown
    await expect(page.locator('text=test.employee@example.com')).toBeVisible();
    
    // Accounting users should not be visible with employee filter
    const accountingRows = page.locator('tr:has-text("accounting")');
    await expect(accountingRows).toHaveCount(0);
  });
});