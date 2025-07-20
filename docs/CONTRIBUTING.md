# Contributing to Travel Expenses Settlement System

## Welcome Contributors! 🎉

Thank you for your interest in contributing to the Travel Expenses Settlement System. This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone, regardless of background or identity.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks or trolling
- Public or private harassment
- Publishing others' private information without permission

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Docker and Docker Compose
- Git

### Local Development Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/travel-expenses-settlement.git
   cd travel-expenses-settlement
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/travel-expenses-settlement.git
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env.development
   # Edit .env.development with appropriate values
   ```

5. **Start development environment**
   ```bash
   # Start database and services
   docker-compose up -d
   
   # Start development servers
   pnpm run dev
   ```

6. **Verify setup**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - API Health: http://localhost:5000/api/health

## Development Process

### Branch Naming Convention

- `feature/issue-number-short-description` - New features
- `bugfix/issue-number-short-description` - Bug fixes
- `hotfix/issue-number-short-description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

Examples:
- `feature/123-user-authentication`
- `bugfix/456-fix-login-validation`
- `docs/update-api-documentation`

### Workflow

1. **Create an issue** (if one doesn't exist)
2. **Assign yourself** to the issue
3. **Create a branch** from `main`
4. **Make your changes**
5. **Test thoroughly**
6. **Create a pull request**
7. **Address review feedback**
8. **Merge when approved**

### Keeping Your Fork Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Switch to main branch
git checkout main

# Merge upstream changes
git merge upstream/main

# Push to your fork
git push origin main
```

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for formatting
- Prefer functional programming patterns
- Use meaningful variable and function names

#### Code Style Examples

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

const getUserById = async (id: string): Promise<UserProfile | null> => {
  try {
    const user = await userRepository.findById(id);
    return user ? mapToUserProfile(user) : null;
  } catch (error) {
    logger.error('Failed to get user by ID', { id, error });
    throw new UserNotFoundError(`User with ID ${id} not found`);
  }
};

// ❌ Bad
const getUser = async (id: any) => {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return user[0];
};
```

### React Components

- Use functional components with hooks
- Implement proper TypeScript interfaces for props
- Use meaningful component names
- Keep components small and focused
- Use proper accessibility attributes

```tsx
// ✅ Good
interface ExpenseItemProps {
  item: ExpenseItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isEditable: boolean;
}

const ExpenseItemCard: React.FC<ExpenseItemProps> = ({
  item,
  onEdit,
  onDelete,
  isEditable
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4"
      role="article"
      aria-label={`Expense item: ${item.description}`}
    >
      <h3 className="text-lg font-semibold">{item.description}</h3>
      <p className="text-gray-600">{formatCurrency(item.amount)}</p>
      {isEditable && (
        <div className="mt-2 space-x-2">
          <button
            onClick={() => onEdit(item.id)}
            className="btn btn-primary"
            aria-label={`Edit ${item.description}`}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="btn btn-danger"
            aria-label={`Delete ${item.description}`}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
```

### CSS/Styling

- Use TailwindCSS utility classes
- Follow mobile-first responsive design
- Use semantic class names for custom CSS
- Ensure proper color contrast for accessibility

### API Design

- Follow RESTful conventions
- Use consistent error response format
- Implement proper HTTP status codes
- Include request validation
- Document all endpoints

```typescript
// ✅ Good API endpoint
app.get('/api/expense-reports/:id', 
  authenticateToken,
  validateUUID('id'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const report = await expenseReportService.getById(id, userId);
      
      if (!report) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'REPORT_NOT_FOUND',
            message: 'Expense report not found'
          }
        });
      }
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error('Failed to get expense report', { id, error });
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve expense report'
        }
      });
    }
  }
);
```

## Testing

### Test Types

1. **Unit Tests** - Test individual functions/components
2. **Integration Tests** - Test API endpoints and database interactions
3. **E2E Tests** - Test complete user workflows

### Testing Guidelines

- Write tests for all new features
- Maintain minimum 80% code coverage
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Running Tests

```bash
# Run all tests
pnpm run test

# Run tests with coverage
pnpm run test:coverage

# Run E2E tests
pnpm run test:e2e

# Run specific test file
pnpm run test -- --testNamePattern="UserService"
```

### Test Examples

```typescript
// Unit test example
describe('UserService', () => {
  describe('validateEmail', () => {
    it('should return true for valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.email+tag@domain.co.uk'
      ];
      
      validEmails.forEach(email => {
        expect(UserService.validateEmail(email)).toBe(true);
      });
    });
    
    it('should return false for invalid email addresses', () => {
      const invalidEmails = ['invalid', '@domain.com', 'user@'];
      
      invalidEmails.forEach(email => {
        expect(UserService.validateEmail(email)).toBe(false);
      });
    });
  });
});

// Integration test example
describe('POST /api/expense-reports', () => {
  it('should create expense report for authenticated user', async () => {
    const token = await getAuthToken('employee@example.com');
    
    const reportData = {
      title: 'Test Trip',
      tripPurpose: 'Business meeting',
      tripStartDate: '2024-01-15',
      tripEndDate: '2024-01-17'
    };
    
    const response = await request(app)
      .post('/api/expense-reports')
      .set('Authorization', `Bearer ${token}`)
      .send(reportData)
      .expect(201);
      
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(reportData.title);
  });
});
```

## Submitting Changes

### Pull Request Process

1. **Ensure your branch is up to date**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks locally**
   ```bash
   pnpm run lint
   pnpm run typecheck
   pnpm run test
   pnpm run validate:env
   ```

3. **Create descriptive commits**
   ```bash
   git commit -m "feat: add expense report approval workflow
   
   - Add approval/rejection endpoints
   - Implement email notifications
   - Update status tracking
   
   Fixes #123"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/123-expense-approval
   ```

5. **Create pull request**
   - Use the PR template
   - Link to related issues
   - Provide clear description
   - Add screenshots for UI changes

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #123

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] No console errors
```

### Commit Message Convention

Use conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add JWT token refresh mechanism
fix(ui): resolve mobile navigation menu overlay issue
docs(api): update expense report endpoints documentation
```

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Clear title** describing the issue
2. **Steps to reproduce** the problem
3. **Expected behavior**
4. **Actual behavior**
5. **Environment details** (OS, browser, Node.js version)
6. **Screenshots** or logs if applicable

### Feature Requests

For feature requests, please include:

1. **Problem description** - What problem does this solve?
2. **Proposed solution** - How should it work?
3. **Alternatives considered** - Other approaches you've thought about
4. **Additional context** - Any other relevant information

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## Development Tools

### Recommended IDE Setup

**Visual Studio Code** with extensions:
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
- Thunder Client (for API testing)

### Useful Commands

```bash
# Code quality
pnpm run lint          # Run ESLint
pnpm run lint:fix      # Fix ESLint issues
pnpm run format        # Format code with Prettier
pnpm run typecheck     # TypeScript type checking

# Development
pnpm run dev           # Start development servers
pnpm run build         # Build for production
pnpm run validate:env  # Validate environment variables

# Testing
pnpm run test          # Run all tests
pnpm run test:watch    # Run tests in watch mode
pnpm run test:e2e      # Run E2E tests

# Docker
docker-compose up -d   # Start development services
docker-compose logs -f # View logs
docker-compose down    # Stop services
```

## Community

### Getting Help

- **Documentation**: Check existing docs first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Participate in PR reviews

### Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Annual contributor recognition

Thank you for contributing to the Travel Expenses Settlement System! 🚀