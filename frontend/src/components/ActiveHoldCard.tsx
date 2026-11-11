import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { StudentHold } from '../types';

interface ActiveHoldCardProps {
  hold: StudentHold;
  onConfirm: (holdId: string) => Promise<void>;
  onCancel: (holdId: string) => Promise<void>;
  isLoading: boolean;
}

export const ActiveHoldCard: React.FC<ActiveHoldCardProps> = ({
  hold,
  onConfirm,
  onCancel,
  isLoading,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const diff = Math.floor((new Date(hold.expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  useEffect(() => {
    const calculateDiff = () => {
      const diff = Math.floor((new Date(hold.expiresAt).getTime() - Date.now()) / 1000);
      return Math.max(0, diff);
    };

    setSecondsRemaining(calculateDiff());

    const interval = setInterval(() => {
      const remaining = calculateDiff();
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hold.expiresAt]);

  const isExpired = secondsRemaining === 0 || hold.status === 'EXPIRED';
  const isHeld = hold.status === 'HELD' && !isExpired;
  const isConfirmed = hold.status === 'CONFIRMED';

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Dynamic hold duration calculation for progress bar (defaults to 600s if createdAt not present)
  const totalDuration = hold.createdAt
    ? Math.max(1, Math.floor((new Date(hold.expiresAt).getTime() - new Date(hold.createdAt).getTime()) / 1000))
    : 600;

  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / totalDuration) * 100));

  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-500 shadow-md p-6 relative overflow-hidden transition-all">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              চলমান আবেদন (Active Application)
            </span>
            <span className="text-xs font-mono text-slate-400">#{hold.holdId}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">{hold.className}</h3>
        </div>

        {/* Status Indicator */}
        <div>
          {isConfirmed ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ভর্তি নিশ্চিত (CONFIRMED)
            </span>
          ) : isExpired ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              সময় শেষ (EXPIRED)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600 animate-spin-slow" />
              সংরক্ষিত (HELD)
            </span>
          )}
        </div>
      </div>

      {/* Countdown Timer (Rule 9) */}
      {isHeld && (
        <div className="my-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              ফি প্রদানের সময় বাকি (Countdown Timer):
            </span>
            <span className="font-mono text-lg font-extrabold text-amber-700 tracking-wider">
              {formatTime(secondsRemaining)}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                secondsRemaining < 60 ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Expired Alert */}
      {isExpired && !isConfirmed && (
        <div className="my-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          আবেদনের সময়সীমা শেষ হয়ে গেছে। আসনটি পুনরায় সবার জন্য উন্মুক্ত হয়েছে। আপনি চাইলে নিচে থেকে আবার আবেদন করতে পারেন।
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-end gap-3 pt-2">
        <button
          onClick={() => onCancel(hold.holdId)}
          disabled={isLoading || isConfirmed}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <XCircle className="w-4 h-4" />
          <span>আবেদন বাতিল করুন</span>
        </button>

        <button
          onClick={() => onConfirm(hold.holdId)}
          disabled={isLoading || !isHeld}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
            isHeld
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span>ভর্তি ফি দিন ও নিশ্চিত করুন (Pay for Confirmation)</span>
        </button>
      </div>
    </div>
  );
};

