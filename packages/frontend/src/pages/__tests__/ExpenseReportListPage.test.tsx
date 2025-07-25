import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ExpenseReportListPage } from '../ExpenseReportListPage';

// Mock the dependencies
jest.mock('@/services/api', () => ({
  api: {
    expenseReports: {
      getAll: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user1', role: 'employee' },
  }),
}));

jest.mock('@/utils/constants', () => ({
  EXPENSE_STATUSES: [
    { value: 'draft', label: '下書き', color: 'gray' },
    { value: 'submitted', label: '申請中', color: 'blue' },
    { value: 'approved', label: '承認済', color: 'green' },
    { value: 'rejected', label: '却下', color: 'red' },
    { value: 'paid', label: '支払済', color: 'purple' },
  ],
}));

// Mock the Layout component
jest.mock('@/components/layout/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>,
}));

// Mock the ExpenseReportCard component
jest.mock('@/components/features/expense-reports/ExpenseReportCard', () => ({
  ExpenseReportCard: ({ report, onEdit, onDelete }: any) => (
    <div data-testid={`report-card-${report.id}`}>
      <span>{report.title}</span>
      <button onClick={onEdit} data-testid={`edit-${report.id}`}>編集</button>
      <button onClick={onDelete} data-testid={`delete-${report.id}`}>削除</button>
    </div>
  ),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const { api } = require('@/services/api');

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('ExpenseReportListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock response
    api.expenseReports.getAll.mockResolvedValue({
      success: true,
      data: {
        reports: [
          {
            id: 'report1',
            title: 'テスト出張1',
            trip_purpose: 'テスト目的1',
            status: 'draft',
            total_amount: 10000,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'report2',
            title: 'テスト出張2',
            trip_purpose: 'テスト目的2',
            status: 'submitted',
            total_amount: 20000,
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        totalPages: 1,
        total: 2,
      },
    });
  });

  it('renders page title and create button', async () => {
    renderWithRouter(<ExpenseReportListPage />);

    expect(screen.getByText('精算申請一覧')).toBeInTheDocument();
    expect(screen.getByTestId('create-new-button')).toBeInTheDocument();
  });

  it('renders with Layout component', async () => {
    renderWithRouter(<ExpenseReportListPage />);

    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    api.expenseReports.getAll.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter(<ExpenseReportListPage />);

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument(); // Loading spinner
  });

  it('displays expense reports when loaded', async () => {
    renderWithRouter(<ExpenseReportListPage />);

    await waitFor(() => {
      expect(screen.getByText('テスト出張1')).toBeInTheDocument();
      expect(screen.getByText('テスト出張2')).toBeInTheDocument();
    });
  });

  it('displays error message when API call fails', async () => {
    api.expenseReports.getAll.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter(<ExpenseReportListPage />);

    await waitFor(() => {
      expect(screen.getByText(/申請の取得に失敗しました/)).toBeInTheDocument();
    });
  });

  it('navigates to create page when create button is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithRouter(<ExpenseReportListPage />);

    const createButton = screen.getByTestId('create-new-button');
    await user.click(createButton);

    expect(mockNavigate).toHaveBeenCalledWith('/expense-reports/new');
  });

  it('filters reports by status', async () => {
    const user = userEvent.setup();
    
    renderWithRouter(<ExpenseReportListPage />);

    await waitFor(() => {
      expect(screen.getByText('テスト出張1')).toBeInTheDocument();
    });

    // Change status filter to 'submitted'
    const statusSelect = screen.getByDisplayValue('全てのステータス');
    await user.selectOptions(statusSelect, 'submitted');

    expect(api.expenseReports.getAll).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      status: 'submitted',
    });
  });

  it('shows empty state when no reports exist', async () => {
    api.expenseReports.getAll.mockResolvedValue({
      success: true,
      data: {
        reports: [],
        totalPages: 1,
        total: 0,
      },
    });
    
    renderWithRouter(<ExpenseReportListPage />);

    await waitFor(() => {
      expect(screen.getByText('申請がありません')).toBeInTheDocument();
      expect(screen.getByText('最初の申請を作成')).toBeInTheDocument();
    });
  });

  it('filters reports by search term', async () => {
    const user = userEvent.setup();
    
    renderWithRouter(<ExpenseReportListPage />);

    await waitFor(() => {
      expect(screen.getByText('テスト出張1')).toBeInTheDocument();
      expect(screen.getByText('テスト出張2')).toBeInTheDocument();
    });

    // Search for specific term
    const searchInput = screen.getByPlaceholderText('タイトルまたは出張目的で検索...');
    await user.type(searchInput, 'テスト出張1');

    await waitFor(() => {
      expect(screen.getByText('テスト出張1')).toBeInTheDocument();
      expect(screen.queryByText('テスト出張2')).not.toBeInTheDocument();
    });
  });

  it('handles edit action', async () => {
    const user = userEvent.setup();
    
    renderWithRouter(<ExpenseReportListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('edit-report1')).toBeInTheDocument();
    });

    const editButton = screen.getByTestId('edit-report1');
    await user.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/expense-reports/report1/edit');
  });

  it('handles delete action', async () => {
    const user = userEvent.setup();
    api.expenseReports.delete.mockResolvedValue({ success: true });
    
    renderWithRouter(<ExpenseReportListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('delete-report1')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('delete-report1');
    await user.click(deleteButton);

    expect(api.expenseReports.delete).toHaveBeenCalledWith('report1');
  });
});