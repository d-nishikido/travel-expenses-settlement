export const testUsers = {
  employee: {
    email: process.env.TEST_EMPLOYEE_EMAIL || 'employee1@example.com',
    password: process.env.TEST_EMPLOYEE_PASSWORD || 'password',
    name: '社員太郎',
    role: 'employee'
  },
  accounting: {
    email: process.env.TEST_ACCOUNTING_EMAIL || 'admin@example.com',
    password: process.env.TEST_ACCOUNTING_PASSWORD || 'password',
    name: '経理部管理者',
    role: 'accounting'
  }
};

export const testExpenseReport = {
  title: 'Business Trip to Tokyo',
  purpose: 'Client meeting and product demonstration',
  startDate: '2024-01-15',
  endDate: '2024-01-20',
  items: [
    {
      category: 'transportation',
      description: 'Flight tickets JFK-NRT',
      amount: '1500.00',
      date: '2024-01-15'
    },
    {
      category: 'accommodation',
      description: 'Hotel stay - 5 nights',
      amount: '750.00',
      date: '2024-01-15'
    },
    {
      category: 'meal',
      description: 'Business dinner with clients',
      amount: '120.00',
      date: '2024-01-17'
    }
  ]
};

export function generateUniqueReportTitle(): string {
  const timestamp = Date.now();
  return `Test Report - ${timestamp}`;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return formatDate(date);
}