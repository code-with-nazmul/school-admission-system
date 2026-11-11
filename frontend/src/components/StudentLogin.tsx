import { useState, type FormEvent } from 'react';
import { UserCheck, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface StudentLoginProps {
  onEnterPortal: (studentId: string) => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onEnterPortal }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const cleanDigits = inputValue.replace(/\D/g, '').slice(0, 17);
  const isValid = cleanDigits.length === 17;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError('জন্ম নিবন্ধন নম্বরটি অবশ্যই ঠিক ১৭ অঙ্কের সংখ্যা হতে হবে।');
      return;
    }
    setError('');
    onEnterPortal(cleanDigits);
  };

  const handleSelectDemoId = (demoId: string) => {
    setInputValue(demoId);
    setError('');
    onEnterPortal(demoId);
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">শিক্ষার্থী পোর্টালে প্রবেশ</h2>
          <p className="text-sm text-slate-500 mt-1">
            আবেদন ও আসন নিশ্চিতকরণের জন্য ১৭ অঙ্কের জন্ম নিবন্ধন নম্বর দিন
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="studentId" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                জন্ম নিবন্ধন নম্বর (১৭ অঙ্ক)
              </label>
              <span
                className={`text-xs font-mono font-medium ${
                  isValid ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {cleanDigits.length} / 17
              </span>
            </div>
            <div className="relative">
              <input
                id="studentId"
                type="text"
                inputMode="numeric"
                maxLength={17}
                placeholder="যেমন: 00000000000000001"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value.replace(/\D/g, '').slice(0, 17));
                  setError('');
                }}
                className={`w-full px-4 py-2.5 rounded-xl border font-mono text-sm tracking-wider focus:outline-none focus:ring-2 transition-all ${
                  isValid
                    ? 'border-emerald-400 focus:ring-emerald-200 bg-emerald-50/30'
                    : error
                    ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                }`}
              />
            </div>
            {error && (
              <p className="flex items-center gap-1 text-xs text-rose-600 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              isValid
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>পোর্টালে প্রবেশ করুন</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Quick Select Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>দ্রুত পরীক্ষার জন্য ডেমো আইডি (Quick Demo IDs):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelectDemoId('00000000000000001')}
              className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 text-xs font-mono transition-colors text-slate-700"
            >
              <span className="block font-sans text-[10px] text-slate-400 font-semibold uppercase">শিক্ষার্থী ১</span>
              ...00000000000000001
            </button>
            <button
              type="button"
              onClick={() => handleSelectDemoId('00000000000000002')}
              className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 text-xs font-mono transition-colors text-slate-700"
            >
              <span className="block font-sans text-[10px] text-slate-400 font-semibold uppercase">শিক্ষার্থী ২</span>
              ...00000000000000002
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
