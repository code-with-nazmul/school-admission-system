import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyApplicationsTable } from '../components/MyApplicationsTable';
import { StudentHold } from '../types';

describe('MyApplicationsTable Component (Application History)', () => {
  it('renders empty message when student has no applications', () => {
    render(<MyApplicationsTable holds={[]} />);
    expect(screen.getByText('আপনার কোনো পূর্ববর্তী আবেদন পাওয়া যায়নি।')).toBeInTheDocument();
  });

  it('renders application rows with proper status badges and permanent admission labels', () => {
    const mockHolds: StudentHold[] = [
      {
        holdId: 'h_001',
        classId: 'c_001',
        className: 'Class 10 - Morning Shift',
        status: 'CONFIRMED',
        expiresAt: new Date().toISOString(),
      },
      {
        holdId: 'h_002',
        classId: 'c_002',
        className: 'Class 8 - Day Shift',
        status: 'HELD',
        expiresAt: new Date(Date.now() + 600 * 1000).toISOString(),
      },
      {
        holdId: 'h_003',
        classId: 'c_003',
        className: 'Class 6 - Morning Shift',
        status: 'EXPIRED',
        expiresAt: new Date(Date.now() - 60 * 1000).toISOString(),
      },
      {
        holdId: 'h_004',
        classId: 'c_004',
        className: 'Class 5 - Day Shift',
        status: 'CANCELLED',
        expiresAt: new Date().toISOString(),
      },
    ];

    render(<MyApplicationsTable holds={mockHolds} />);

    // Table header
    expect(screen.getByText('আমার সকল আবেদন হিস্টোরি (My Applications)')).toBeInTheDocument();

    // Check application IDs and class names
    expect(screen.getByText('h_001')).toBeInTheDocument();
    expect(screen.getByText('Class 10 - Morning Shift')).toBeInTheDocument();
    expect(screen.getByText('h_002')).toBeInTheDocument();
    expect(screen.getByText('Class 8 - Day Shift')).toBeInTheDocument();

    // Check status badges
    expect(screen.getByText(/ভর্তি নিশ্চিত \(CONFIRMED\)/i)).toBeInTheDocument();
    expect(screen.getByText(/সংরক্ষিত \(HELD\)/i)).toBeInTheDocument();
    expect(screen.getByText(/সময় শেষ \(EXPIRED\)/i)).toBeInTheDocument();
    expect(screen.getByText(/বাতিলকৃত \(CANCELLED\)/i)).toBeInTheDocument();

    // Confirmed hold should display permanent admission label instead of expiration time
    expect(screen.getByText('— (স্থায়ী ভর্তি)')).toBeInTheDocument();
  });
});

