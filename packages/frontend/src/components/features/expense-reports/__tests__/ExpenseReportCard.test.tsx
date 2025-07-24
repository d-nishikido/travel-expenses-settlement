import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ExpenseReportCard } from '../ExpenseReportCard';
import { ExpenseReport } from '@/types';

// Mock the dependencies
jest.mock('@/utils/formatters', () => ({
  formatCurrency: (amount: number) => `¥${amount.toLocaleString()}`,
  formatDate: (date: string) => new Date(date).toLocaleDateString('ja-JP'),
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

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user1', role: 'employee' },
  }),
}));

const mockReport: ExpenseReport = {
  id: 'report1',
  user_id: 'user1',
  title: 'テスト出張',
  trip_purpose: 'テスト目的',
  trip_start_date: '2024-01-01',
  trip_end_date: '2024-01-02',
  status: 'draft',
  total_amount: 10000,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockOnEdit = jest.fn();
const mockOnDelete = jest.fn();

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('ExpenseReportCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders report information correctly', () => {
    renderWithRouter(
      <ExpenseReportCard
        report={mockReport}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('テスト出張')).toBeInTheDocument();
    expect(screen.getByText('テスト目的')).toBeInTheDocument();
    expect(screen.getByText('下書き')).toBeInTheDocument();
    expect(screen.getByTestId('report-total')).toHaveTextContent('¥10,000');
  });

  it('shows edit and delete buttons for draft status', () => {
    renderWithRouter(
      <ExpenseReportCard
        report={mockReport}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('edit-report-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-report-button')).toBeInTheDocument();
  });

  it('does not show edit and delete buttons for submitted status', () => {
    const submittedReport = { ...mockReport, status: 'submitted' as const };
    
    renderWithRouter(
      <ExpenseReportCard
        report={submittedReport}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByTestId('edit-report-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-report-button')).not.toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithRouter(
      <ExpenseReportCard
        report={mockReport}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByTestId('edit-report-button');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('shows delete confirmation dialog when delete button is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithRouter(
      <ExpenseReportCard
        report={mockReport}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-report-button');
    await user.click(deleteButton);

    expect(screen.getByText('申請を削除しますか？')).toBeInTheDocument();
    expect(screen.getByText('本当にこの精算申請を削除しますか？')).toBeInTheDocument();
  });

  it('calls onDelete when delete is confirmed', async () => {
    const user = userEvent.setup();
    
    renderWithRouter(
      <ExpenseReportCard
        report={mockReport}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-report-button');
    await user.click(deleteButton);

    const confirmButton = screen.getByTestId('confirm-delete');
    await user.click(confirmButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('closes delete confirmation dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    
    renderWithRouter(
      <ExpenseReportCard
        report={mockReport}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-report-button');
    await user.click(deleteButton);

    const cancelButton = screen.getByText('キャンセル');
    await user.click(cancelButton);

    expect(screen.queryByText('申請を削除しますか？')).not.toBeInTheDocument();
  });

  it('shows view button for all reports', () => {
    renderWithRouter(
      <ExpenseReportCard
        report={mockReport}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('view-report-button')).toBeInTheDocument();
  });

  it('displays correct status colors', () => {
    const statusVariants: Array<{ status: any; expectedClass: string }> = [
      { status: 'draft', expectedClass: 'bg-gray-100 text-gray-800' },
      { status: 'submitted', expectedClass: 'bg-blue-100 text-blue-800' },
      { status: 'approved', expectedClass: 'bg-green-100 text-green-800' },
      { status: 'rejected', expectedClass: 'bg-red-100 text-red-800' },
      { status: 'paid', expectedClass: 'bg-purple-100 text-purple-800' },
    ];

    statusVariants.forEach(({ status, expectedClass }) => {
      const { container } = renderWithRouter(
        <ExpenseReportCard
          report={{ ...mockReport, status }}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      const statusBadge = container.querySelector('.inline-flex.items-center.px-2\\.5.py-0\\.5');
      expect(statusBadge).toHaveClass(...expectedClass.split(' '));
    });
  });
});