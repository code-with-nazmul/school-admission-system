import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ClassCard } from '../components/ClassCard';
import { ClassItem } from '../types';

describe('ClassCard Component (Seat Display & Action States)', () => {
  const mockClass: ClassItem = {
    id: 'c_001',
    name: 'Class 6 - Morning Shift',
    totalSeats: 120,
    heldSeats: 10,
    confirmedSeats: 80,
    availableSeats: 30,
    holdDurationSeconds: 600,
  };

  it('renders class details and seat count metrics', () => {
    const onApply = vi.fn();

    render(
      <ClassCard
        classItem={mockClass}
        isConfirmedInThisClass={false}
        isHeldInThisClass={false}
        onApply={onApply}
        isLoading={false}
      />,
    );

    expect(screen.getByText('Class 6 - Morning Shift')).toBeInTheDocument();
    expect(screen.getByText('ID: c_001')).toBeInTheDocument();
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();

    const applyBtn = screen.getByRole('button', { name: /আসন গ্রহণ করুন/i });
    expect(applyBtn).toBeEnabled();
  });

  it('calls onApply with classId when apply button is clicked', () => {
    const onApply = vi.fn();

    render(
      <ClassCard
        classItem={mockClass}
        isConfirmedInThisClass={false}
        isHeldInThisClass={false}
        onApply={onApply}
        isLoading={false}
      />,
    );

    const applyBtn = screen.getByRole('button', { name: /আসন গ্রহণ করুন/i });
    fireEvent.click(applyBtn);

    expect(onApply).toHaveBeenCalledWith('c_001');
  });

  it('renders disabled Full button when available seats are 0', () => {
    const onApply = vi.fn();
    const fullClass: ClassItem = {
      ...mockClass,
      heldSeats: 20,
      confirmedSeats: 100,
      availableSeats: 0,
    };

    render(
      <ClassCard
        classItem={fullClass}
        isConfirmedInThisClass={false}
        isHeldInThisClass={false}
        onApply={onApply}
        isLoading={false}
      />,
    );

    const fullBtn = screen.getByRole('button', { name: /সব আসন পূর্ণ/i });
    expect(fullBtn).toBeDisabled();
  });

  it('renders confirmed badge when student already confirmed admission in this class', () => {
    const onApply = vi.fn();

    render(
      <ClassCard
        classItem={mockClass}
        isConfirmedInThisClass={true}
        isHeldInThisClass={false}
        onApply={onApply}
        isLoading={false}
      />,
    );

    const confirmedBadge = screen.getByText(/আপনার ভর্তি নিশ্চিত \(Confirmed\)/i);
    expect(confirmedBadge).toBeInTheDocument();
  });

  it('renders held badge with cancel and pay action buttons when student has active hold in this class', async () => {
    const onApply = vi.fn();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    render(
      <ClassCard
        classItem={mockClass}
        isConfirmedInThisClass={false}
        isHeldInThisClass={true}
        heldHoldId="h_123"
        onApply={onApply}
        onConfirm={onConfirm}
        onCancel={onCancel}
        isLoading={false}
      />,
    );

    expect(screen.getByText(/আবেদন সংরক্ষিত \(Seat Held\)/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /বাতিল \(Cancel\)/i });
    const payBtn = screen.getByRole('button', { name: /নিশ্চিত করুন \(Pay\)/i });

    expect(cancelBtn).toBeEnabled();
    expect(payBtn).toBeEnabled();

    await act(async () => {
      fireEvent.click(payBtn);
    });
    expect(onConfirm).toHaveBeenCalledWith('h_123');

    await act(async () => {
      fireEvent.click(cancelBtn);
    });
    expect(onCancel).toHaveBeenCalledWith('h_123');
  });
});
