import { Sun, Sunset, Users, ArrowRight, Loader2, CheckCircle2, Clock } from 'lucide-react';
import { ClassItem } from '../types';

interface ClassCardProps {
  classItem: ClassItem;
  isConfirmedInThisClass: boolean;
  isHeldInThisClass: boolean;
  onApply: (classId: string) => Promise<void>;
  isLoading: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classItem,
  isConfirmedInThisClass,
  isHeldInThisClass,
  onApply,
  isLoading,
}) => {
  const isMorning = classItem.name.toLowerCase().includes('morning') ||
                    classItem.name.includes('প্রভাতী');
  const isFull = classItem.availableSeats <= 0;

  return (
    <div
      className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
        isConfirmedInThisClass
          ? 'border-emerald-300 ring-2 ring-emerald-100'
          : isHeldInThisClass
          ? 'border-amber-300 ring-2 ring-amber-100'
          : 'border-slate-200 hover:border-indigo-300'
      }`}
    >
      {/* Header with Name and Shift */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isMorning
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {isMorning ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Sunset className="w-3.5 h-3.5 text-blue-500" />}
            <span>{isMorning ? 'প্রভাতী শাখা (Morning)' : 'দিবা শাখা (Day)'}</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">ID: {classItem.id}</span>
        </div>

        <h3 className="text-base font-bold text-slate-900 leading-tight mb-4">
          {classItem.name}
        </h3>

        {/* Seat Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="block text-[11px] font-medium text-slate-500">মোট আসন (Total)</span>
            <span className="text-sm font-bold text-slate-800">{classItem.totalSeats}</span>
          </div>

          <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
            <span className="block text-[11px] font-medium text-amber-800">সংরক্ষিত (Held)</span>
            <span className="text-sm font-bold text-amber-900">{classItem.heldSeats}</span>
          </div>

          <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
            <span className="block text-[11px] font-medium text-blue-800">নিশ্চিত (Confirmed)</span>
            <span className="text-sm font-bold text-blue-900">{classItem.confirmedSeats}</span>
          </div>

          <div
            className={`p-2.5 rounded-xl border ${
              isFull
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <span className="block text-[11px] font-medium">খালি আসন (Available)</span>
            <span className="text-base font-extrabold">{classItem.availableSeats}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div>
        {isConfirmedInThisClass ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-not-allowed shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>আপনার ভর্তি নিশ্চিত (Confirmed)</span>
          </button>
        ) : isHeldInThisClass ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 cursor-not-allowed shadow-xs"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>আবেদন সংরক্ষিত (Seat Held)</span>
          </button>
        ) : isFull ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          >
            <Users className="w-4 h-4" />
            <span>সব আসন পূর্ণ (Full)</span>
          </button>
        ) : (
          <button
            onClick={() => onApply(classItem.id)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-xs hover:shadow cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span>আসন গ্রহণ করুন (Take this class)</span>
          </button>
        )}
      </div>
    </div>
  );
};
