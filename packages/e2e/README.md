# E2E Tests - Travel Expenses Settlement System

This package contains end-to-end tests for the Travel Expenses Settlement System using [Playwright](https://playwright.dev/) with MCP (Model Context Protocol) server integration.

## 🎯 Test Coverage

### Authentication Flow
- ✅ User login (employee/accounting roles)
- ✅ User logout
- ✅ Session management and persistence
- ✅ Protected route access control

### Employee Workflows
- ✅ Create expense reports
- ✅ Add/edit/delete expense items
- ✅ Submit reports for approval
- ✅ View report status and history

### Accounting Workflows
- ✅ Approve/reject expense reports
- ✅ Mark reports as paid
- ✅ User management (CRUD operations)
- ✅ Generate reports and analytics

## 🏗️ Architecture

### Directory Structure
```
e2e/
├── tests/                  # Test specifications
│   ├── auth/              # Authentication tests
│   ├── expense-reports/   # Employee workflow tests
│   └── admin/             # Accounting workflow tests
├── page-objects/          # Page Object Model classes
├── fixtures/              # Custom test fixtures
├── utils/                 # Test utilities and helpers
├── playwright.config.ts   # Playwright configuration
└── .env.test             # Test environment variables
```

### Page Object Model
The tests use the Page Object Model pattern for better maintainability:

- `BasePage`: Common page functionality
- `LoginPage`: Login form interactions
- `DashboardPage`: Main dashboard navigation
- `ExpenseReportPage`: Expense report management

### Test Fixtures
Custom fixtures provide:
- Pre-configured page objects
- API helpers for data setup/cleanup
- Authentication utilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm package manager
- Docker (for containerized testing)

### Installation
```bash
# Install dependencies
cd packages/e2e
pnpm install

# Install Playwright browsers
npx playwright install
```

### Configuration
Copy and configure the test environment:
```bash
cp .env.test.example .env.test
# Edit .env.test with your test configuration
```

## 🧪 Running Tests

### Local Development
```bash
# Run all tests (headless)
pnpm test

# Run tests with UI mode
pnpm test:ui

# Run tests in headed mode (visible browser)
pnpm test:headed

# Run specific test file
pnpm test tests/auth/login.spec.ts

# Debug specific test
pnpm test:debug tests/auth/login.spec.ts
```

### Using Docker
```bash
# Run E2E tests in Docker environment
pnpm run test:e2e:docker

# Cleanup Docker resources
pnpm run test:e2e:docker:cleanup
```

### CI/CD
E2E tests run automatically on:
- Pull requests to main/develop branches
- Pushes to main/develop branches
- Manual workflow dispatch

## 📊 Test Reports

### Playwright HTML Report
After running tests, view the HTML report:
```bash
pnpm test:report
```

### Screenshots and Videos
- Screenshots: Captured on test failures
- Videos: Recorded for failed tests
- Traces: Available for debugging

## 🔧 Configuration

### Environment Variables
```bash
# Application URLs
BASE_URL=http://localhost:3000
API_URL=http://localhost:4000

# Test User Credentials
TEST_EMPLOYEE_EMAIL=test.employee@example.com
TEST_EMPLOYEE_PASSWORD=TestEmployee123!
TEST_ACCOUNTING_EMAIL=test.accounting@example.com
TEST_ACCOUNTING_PASSWORD=TestAccounting123!

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/travel_expenses_test

# Test Configuration
HEADLESS=true
SLOW_MO=0
TIMEOUT=30000
```

### Playwright Configuration
Key settings in `playwright.config.ts`:
- **Browsers**: Chromium, Firefox, WebKit, Mobile
- **Parallel Execution**: Enabled for faster test runs
- **Retries**: 2 retries in CI, 0 in local development
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On first retry

## 🛠️ Writing Tests

### Basic Test Structure
```typescript
import { test, expect } from '../../fixtures/test-fixtures';
import { loginAs } from '../../utils/auth-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'employee');
  });

  test('should perform expected behavior', async ({ page, loginPage }) => {
    // Test implementation
    await loginPage.goto();
    await expect(page).toHaveURL(/\/login/);
  });
});
```

### Using Page Objects
```typescript
test('should create expense report', async ({ expenseReportPage }) => {
  await expenseReportPage.goto();
  await expenseReportPage.fillReportDetails({
    title: 'Business Trip',
    purpose: 'Client meeting',
    startDate: '2024-01-15',
    endDate: '2024-01-20'
  });
  await expenseReportPage.saveReport();
});
```

### Data Management
```typescript
import { generateUniqueReportTitle, testExpenseReport } from '../../utils/test-data';

// Use test data utilities
const reportData = {
  title: generateUniqueReportTitle(),
  ...testExpenseReport
};
```

## 🔍 Debugging

### Local Debugging
```bash
# Run with debug mode
pnpm test:debug

# Use Playwright inspector
npx playwright test --debug

# Generate code
npx playwright codegen http://localhost:3000
```

### CI Debugging
1. Download test artifacts from GitHub Actions
2. View Playwright HTML report
3. Examine screenshots and videos
4. Check trace files for detailed execution

## 🚨 Troubleshooting

### Common Issues

#### Tests failing in CI but passing locally
- Check environment variables
- Verify Docker container health
- Review server startup logs

#### Element not found errors
- Verify test-id attributes exist
- Check page load timing
- Use explicit waits for dynamic content

#### Authentication issues
- Verify test user credentials
- Check JWT token expiration
- Ensure database seeding

### Best Practices
- Use data-testid attributes for reliable element selection
- Implement proper waiting strategies
- Clean up test data between runs
- Use Page Object Model for maintainability
- Keep tests independent and isolated

## 📝 MCP Integration

The E2E tests are integrated with MCP (Model Context Protocol) server for Playwright, enabling:
- Enhanced test automation capabilities
- Better integration with Claude Code
- Automated test generation and maintenance

### MCP Configuration
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@automatalabs/mcp-server-playwright"],
      "env": {
        "PLAYWRIGHT_BROWSERS_PATH": "./packages/e2e/browsers"
      }
    }
  }
}
```

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## 🤝 Contributing

When adding new tests:
1. Follow the existing test structure
2. Use Page Object Model pattern
3. Add appropriate test data utilities
4. Update this documentation
5. Ensure tests pass in CI environment