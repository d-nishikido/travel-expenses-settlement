import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseReportForm } from '../ExpenseReportForm';

// Mock the dependencies
jest.mock('@/utils/formatters', () => ({
  formatDateForInput: (date: Date) => date.toISOString().split('T')[0],
  formatCurrency: (amount: number) => `¥${amount.toLocaleString()}`,
}));

jest.mock('@/utils/constants', () => ({
  EXPENSE_CATEGORIES: [
    { value: 'transportation', label: '交通費' },
    { value: 'accommodation', label: '宿泊費' },
    { value: 'meal', label: '食費' },
    { value: 'other', label: 'その他' },
  ],
}));

const mockOnSubmit = jest.fn();
const mockOnCancel = jest.fn();

describe('ExpenseReportForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <ExpenseReportForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/申請タイトル/)).toBeInTheDocument();
    expect(screen.getByLabelText(/出張目的/)).toBeInTheDocument();
    expect(screen.getByLabelText(/出張開始日/)).toBeInTheDocument();
    expect(screen.getByLabelText(/出張終了日/)).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
    expect(screen.getByText('下書き保存')).toBeInTheDocument();
    expect(screen.getByText('申請を提出')).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();

    render(
      <ExpenseReportForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('下書き保存');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
      expect(screen.getByText('出張目的は必須です')).toBeInTheDocument();
      expect(screen.getByText('出張開始日は必須です')).toBeInTheDocument();
      expect(screen.getByText('出張終了日は必須です')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ExpenseReportForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('キャンセル');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('disables submit button when no expense items are added', async () => {
    const user = userEvent.setup();

    render(
      <ExpenseReportForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Fill required fields
    await user.type(screen.getByLabelText(/申請タイトル/), 'テスト出張');
    await user.type(screen.getByLabelText(/出張目的/), 'テスト目的');
    await user.type(screen.getByLabelText(/出張開始日/), '2024-01-01');
    await user.type(screen.getByLabelText(/出張終了日/), '2024-01-02');

    const submitButton = screen.getByText('申請を提出');
    expect(submitButton).toBeDisabled();
  });

  it('shows rejected status message when editing rejected report', () => {
    render(
      <ExpenseReportForm
        initialData={{ status: 'rejected' }}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEdit={true}
      />
    );

    expect(screen.getByText(/この申請は却下されました/)).toBeInTheDocument();
  });

  it('populates form with initial data when editing', () => {
    const initialData = {
      title: 'テスト出張',
      trip_purpose: 'テスト目的',
      trip_start_date: '2024-01-01',
      trip_end_date: '2024-01-02',
    };

    render(
      <ExpenseReportForm
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEdit={true}
      />
    );

    expect(screen.getByDisplayValue('テスト出張')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テスト目的')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-02')).toBeInTheDocument();
  });
});