import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '../Toast';

describe('Toast', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders success toast correctly', () => {
    render(
      <Toast
        message="Success message"
        type="success"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument();
  });

  it('renders error toast with correct styling', () => {
    render(
      <Toast
        message="Error message"
        type="error"
        onClose={mockOnClose}
      />
    );

    const container = screen.getByText('Error message').closest('div');
    expect(container).toHaveClass('bg-red-50', 'border-red-200');
  });

  it('renders warning toast with correct styling', () => {
    render(
      <Toast
        message="Warning message"
        type="warning"
        onClose={mockOnClose}
      />
    );

    const container = screen.getByText('Warning message').closest('div');
    expect(container).toHaveClass('bg-yellow-50', 'border-yellow-200');
  });

  it('auto-closes after default duration', () => {
    render(
      <Toast
        message="Test message"
        type="success"
        onClose={mockOnClose}
      />
    );

    act(() => {
      jest.advanceTimersByTime(5000); // Default duration
    });

    act(() => {
      jest.advanceTimersByTime(300); // Animation delay
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after custom duration', () => {
    render(
      <Toast
        message="Test message"
        type="success"
        onClose={mockOnClose}
        duration={2000}
      />
    );

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes when close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(
      <Toast
        message="Test message"
        type="success"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByRole('button', { name: '閉じる' });
    await user.click(closeButton);

    act(() => {
      jest.advanceTimersByTime(300); // Animation delay
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});