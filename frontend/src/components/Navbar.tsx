import { GraduationCap, ShieldCheck, User, LogOut, Radio } from 'lucide-react';

interface NavbarProps {
  mode: 'student' | 'admin';
  onToggleMode: (mode: 'student' | 'admin') => void;
  studentId: string;
  onLogoutStudent: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  onToggleMode,
  studentId,
  onLogoutStudent,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
              School Admission System
            </h1>
            <p className="text-xs text-slate-500 font-medium">বিদ্যালয় অনলাইন ভর্তি পোর্টাল</p>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Live Sync Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>লাইভ সংযোগ (3s)</span>
          </div>

          {/* Student / Admin Portal Switcher */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
            <button
              onClick={() => onToggleMode('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                mode === 'student'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>শিক্ষার্থী</span>
            </button>
            <button
              onClick={() => onToggleMode('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                mode === 'admin'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>অ্যাডমিন</span>
            </button>
          </div>

          {/* Active Student Identity Badge & Logout */}
          {mode === 'student' && studentId && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="hidden md:block text-right">
                <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  আইডি
                </span>
                <span className="font-mono text-xs font-semibold text-slate-700">
                  {studentId.slice(0, 4)}...{studentId.slice(-4)}
                </span>
              </div>
              <button
                onClick={onLogoutStudent}
                title="আইডি পরিবর্তন বা প্রস্থান করুন"
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
