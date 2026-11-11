import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveHoldCard } from '../components/ActiveHoldCard';
import { StudentHold } from '../types';

describe('ActiveHoldCard Component (Rule 9: Hold Expiration & Actions)', () => {
  const futureExpiresAt = new Date(Date.now() + 600 * 1000).toISOString();
  const pastExpiresAt = new Date(Date.now() - 60 * 1000).toISOString();

  const mockActiveHold: StudentHold = {
    holdId: 'h_001',
    classId: 'c_001',
    className: 'Class 6 - Morning Shift',
    status: 'HELD',
    expiresAt: futureExpiresAt,
    createdAt: new Date().toISOString(),
  };

  it('renders active hold details and countdown timer', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ActiveHoldCard
        hold={mockActiveHold}
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={false}
      />,
    );

    expect(screen.getByText('Class 6 - Morning Shift')).toBeInTheDocument();
    expect(screen.getByText('#h_001')).toBeInTheDocument();
    expect(screen.getByText(/সংরক্ষিত \(HELD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/ফি প্রদানের সময় বাকি/i)).toBeInTheDocument();

    const payButton = screen.getByRole('button', { name: /ভর্তি ফি দিন ও নিশ্চিত করুন/i });
    expect(payButton).toBeEnabled();

    const cancelButton = screen.getByRole('button', { name: /আবেদন বাতিল করুন/i });
    expect(cancelButton).toBeEnabled();
  });

  it('calls onConfirm when pay & confirm button is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ActiveHoldCard
        hold={mockActiveHold}
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={false}
      />,
    );

    const payButton = screen.getByRole('button', { name: /ভর্তি ফি দিন ও নিশ্চিত করুন/i });
    fireEvent.click(payButton);

    expect(onConfirm).toHaveBeenCalledWith('h_001');
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ActiveHoldCard
        hold={mockActiveHold}
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={false}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: /আবেদন বাতিল করুন/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledWith('h_001');
  });

  it('disables pay button and displays expiration alert when hold is expired (Rule 9)', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const mockExpiredHold: StudentHold = {
      ...mockActiveHold,
      status: 'EXPIRED',
      expiresAt: pastExpiresAt,
    };

    render(
      <ActiveHoldCard
        hold={mockExpiredHold}
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={false}
      />,
    );

    expect(screen.getByText(/সময় শেষ \(EXPIRED\)/i)).toBeInTheDocument();
    expect(screen.getByText(/আবেদনের সময়সীমা শেষ হয়ে গেছে/i)).toBeInTheDocument();

    const payButton = screen.getByRole('button', { name: /ভর্তি ফি দিন ও নিশ্চিত করুন/i });
    expect(payButton).toBeDisabled();
  });

  it('renders confirmed badge when hold status is CONFIRMED', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const mockConfirmedHold: StudentHold = {
      ...mockActiveHold,
      status: 'CONFIRMED',
    };

    render(
      <ActiveHoldCard
        hold={mockConfirmedHold}
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={false}
      />,
    );

    expect(screen.getByText(/ভর্তি নিশ্চিত \(CONFIRMED\)/i)).toBeInTheDocument();
  });
});

