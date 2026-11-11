import { Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { StudentHold } from '../types';

interface MyApplicationsTableProps {
  holds: StudentHold[];
}

export const MyApplicationsTable: React.FC<MyApplicationsTableProps> = ({ holds }) => {
  if (holds.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        <p className="text-sm font-medium">আপনার কোনো পূর্ববর্তী আবেদন পাওয়া যায়নি।</p>
      </div>
    );
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ভর্তি নিশ্চিত (CONFIRMED)
          </span>
        );
      case 'HELD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            সংরক্ষিত (HELD)
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
            সময় শেষ (EXPIRED)
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            বাতিলকৃত (CANCELLED)
          </span>
        );
      default:
        return <span className="text-xs font-medium text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-sm font-bold text-slate-800">আমার সকল আবেদন হিস্টোরি (My Applications)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">আবেদন আইডি</th>
              <th className="px-6 py-3">ক্লাস ও শাখা</th>
              <th className="px-6 py-3">অবস্থা (Status)</th>
              <th className="px-6 py-3">সময়সীমা (Expires At)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {holds.map((h) => (
              <tr key={h.holdId} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-3.5 font-mono font-medium text-slate-900">{h.holdId}</td>
                <td className="px-6 py-3.5 font-semibold text-slate-900">{h.className}</td>
                <td className="px-6 py-3.5">{renderStatusBadge(h.status)}</td>
                <td className="px-6 py-3.5 font-mono text-slate-500">
                  {new Date(h.expiresAt).toLocaleTimeString('bn-BD', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

