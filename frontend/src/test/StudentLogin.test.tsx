import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StudentLogin } from '../components/StudentLogin';

describe('StudentLogin Component (Rule 11)', () => {
  it('renders student entry form with 17-digit requirement text', () => {
    const onEnterPortal = vi.fn();
    render(<StudentLogin onEnterPortal={onEnterPortal} />);

    expect(screen.getByText('শিক্ষার্থী পোর্টালে প্রবেশ')).toBeInTheDocument();
    expect(screen.getByText(/১৭ অঙ্কের জন্ম নিবন্ধন নম্বর দিন/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /পোর্টালে প্রবেশ করুন/i })).toBeDisabled();
  });

  it('keeps submit button disabled when fewer than 17 digits are entered', () => {
    const onEnterPortal = vi.fn();
    render(<StudentLogin onEnterPortal={onEnterPortal} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '123456789' } });

    expect(screen.getByText('9 / 17')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /পোর্টালে প্রবেশ করুন/i })).toBeDisabled();
    expect(onEnterPortal).not.toHaveBeenCalled();
  });

  it('enables submit button and calls onEnterPortal when exactly 17 digits are entered', () => {
    const onEnterPortal = vi.fn();
    render(<StudentLogin onEnterPortal={onEnterPortal} />);

    const input = screen.getByRole('textbox');
    const validId = '20152691234567890';
    fireEvent.change(input, { target: { value: validId } });

    expect(screen.getByText('17 / 17')).toBeInTheDocument();
    const submitBtn = screen.getByRole('button', { name: /পোর্টালে প্রবেশ করুন/i });
    expect(submitBtn).toBeEnabled();

    fireEvent.click(submitBtn);
    expect(onEnterPortal).toHaveBeenCalledWith(validId);
  });

  it('autofills valid ID and calls onEnterPortal when demo button is clicked', () => {
    const onEnterPortal = vi.fn();
    render(<StudentLogin onEnterPortal={onEnterPortal} />);

    const demo1Btn = screen.getByText('শিক্ষার্থী ১');
    fireEvent.click(demo1Btn);

    expect(onEnterPortal).toHaveBeenCalledWith('00000000000000001');
  });
});
