import { useState, type FormEvent } from 'react';
import { PlusCircle, Sun, Sunset, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
import { ClassItem } from '../types';

interface AdminDashboardProps {
  classes: ClassItem[];
  onCreateClass: (name: string, totalSeats: number, holdDurationSeconds?: number) => Promise<void>;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  classes,
  onCreateClass,
  isLoading,
  onRefresh,
}) => {
  const [gradeInput, setGradeInput] = useState('Class 6');
  const [shift, setShift] = useState<'Morning Shift' | 'Day Shift'>('Morning Shift');
  const [totalSeatsInput, setTotalSeatsInput] = useState<string>('120');
  const [holdDurationInput, setHoldDurationInput] = useState<string>('600');

  const toEnglishDigits = (str: string) =>
    str.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());

  const parsedSeats = parseInt(toEnglishDigits(totalSeatsInput), 10) || 0;
  const parsedDuration = parseInt(toEnglishDigits(holdDurationInput), 10) || 600;
  const fullName = `${gradeInput.trim()} - ${shift}`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!gradeInput.trim() || parsedSeats <= 0) return;
    await onCreateClass(fullName, parsedSeats, parsedDuration);
  };

  // Quick preset grade selector
  const quickGrades = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  // Global School Capacity Calculations
  const totalCapacity = classes.reduce((sum, c) => sum + c.totalSeats, 0);
  const totalConfirmed = classes.reduce((sum, c) => sum + c.confirmedSeats, 0);
  const totalHeld = classes.reduce((sum, c) => sum + c.heldSeats, 0);
  const totalAvailable = classes.reduce((sum, c) => sum + c.availableSeats, 0);

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-amber-500 text-white rounded-2xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white shadow-inner">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">অ্যাডমিন কন্ট্রোল প্যানেল</span>
            <h2 className="text-xl font-bold leading-tight">বিদ্যালয় আসন ও ভর্তি ব্যবস্থাপনা</h2>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-white hover:bg-amber-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ করুন</span>
        </button>
      </div>

      {/* Global Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="block text-xs font-medium text-slate-500">মোট ক্লাস শাখা</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{classes.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="block text-xs font-medium text-slate-500">মোট আসন সংখ্যা</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">{totalCapacity}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="block text-xs font-medium text-amber-700">সংরক্ষিত (Held)</span>
          <span className="text-xl font-bold text-amber-900 mt-1 block">{totalHeld}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="block text-xs font-medium text-blue-700">নিশ্চিত ভর্তি</span>
          <span className="text-xl font-bold text-blue-900 mt-1 block">{totalConfirmed}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="block text-xs font-medium text-emerald-700">খালি আসন</span>
          <span className="text-xl font-bold text-emerald-900 mt-1 block">{totalAvailable}</span>
        </div>
      </div>

      {/* Create New Class Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Create New Class & Shift</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Grade Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Class Name
              </label>
              <input
                type="text"
                required
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                placeholder="e.g. Class 6"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm font-medium"
              />

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickGrades.slice(0, 6).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGradeInput(g)}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Shift Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Shift Selection
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShift('Morning Shift')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    shift === 'Morning Shift'
                      ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Morning</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShift('Day Shift')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    shift === 'Day Shift'
                      ? 'border-blue-400 bg-blue-50 text-blue-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <Sunset className="w-4 h-4 text-blue-500" />
                  <span>Day</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Separate class per shift.</p>
            </div>

            {/* Total Seats */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Total Seats
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={totalSeatsInput}
                onChange={(e) => setTotalSeatsInput(toEnglishDigits(e.target.value.replace(/[^\d০-৯]/g, '')))}
                placeholder="e.g. 120"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm font-semibold font-mono"
              />
              <p className="text-[11px] text-slate-400">Seat capacity (e.g. 120)</p>
            </div>

            {/* Hold Duration (Seconds) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Hold Duration (Seconds)
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={holdDurationInput}
                onChange={(e) => setHoldDurationInput(toEnglishDigits(e.target.value.replace(/[^\d০-৯]/g, '')))}
                placeholder="600"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm font-semibold font-mono"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setHoldDurationInput('60')}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors"
                >
                  60s (Test)
                </button>
                <button
                  type="button"
                  onClick={() => setHoldDurationInput('300')}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  300s (5m)
                </button>
                <button
                  type="button"
                  onClick={() => setHoldDurationInput('600')}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-colors"
                >
                  600s (Default)
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Default: 600s (10 min). Editable per Rule 2.</p>
            </div>
          </div>

          {/* Preview & Submit Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="block text-[11px] font-medium text-slate-500">Preview:</span>
              <span className="font-bold text-slate-900 text-sm">
                {fullName} <span className="font-normal text-slate-500">({parsedSeats} seats · {parsedDuration}s hold)</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || !gradeInput.trim() || parsedSeats <= 0}
              className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-xs hover:shadow disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              <span>Create Class</span>
            </button>
          </div>
        </form>
      </div>

      {/* Class List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">বিদ্যমান ক্লাস ও আসন তালিকা ({classes.length})</h3>
          <span className="text-xs text-slate-400">লাইভ আপডেট হচ্ছে</span>
        </div>

        {classes.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">
            এখনো কোনো ক্লাস তৈরি করা হয়নি। উপরের ফর্মটি ব্যবহার করে প্রথম ক্লাস তৈরি করুন।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">আইডি</th>
                  <th className="px-6 py-3">ক্লাসের নাম ও শাখা</th>
                  <th className="px-6 py-3">মোট আসন</th>
                  <th className="px-6 py-3">মেয়াদ (Hold TTL)</th>
                  <th className="px-6 py-3">সংরক্ষিত (Held)</th>
                  <th className="px-6 py-3">নিশ্চিত (Confirmed)</th>
                  <th className="px-6 py-3">খালি আসন</th>
                  <th className="px-6 py-3">অবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {classes.map((cls) => {
                  const isFull = cls.availableSeats <= 0;
                  return (
                    <tr key={cls.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-medium text-slate-900">{cls.id}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-900">{cls.name}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{cls.totalSeats}</td>
                      <td className="px-6 py-3.5 font-mono text-slate-500">{cls.holdDurationSeconds ? `${cls.holdDurationSeconds}s` : '600s'}</td>
                      <td className="px-6 py-3.5 font-semibold text-amber-700">{cls.heldSeats}</td>
                      <td className="px-6 py-3.5 font-semibold text-blue-700">{cls.confirmedSeats}</td>
                      <td className="px-6 py-3.5 font-extrabold text-emerald-700">{cls.availableSeats}</td>
                      <td className="px-6 py-3.5">
                        {isFull ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            পূর্ণ (Full)
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            আসন ফাঁকা
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
