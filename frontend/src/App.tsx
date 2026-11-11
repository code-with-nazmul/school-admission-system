import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudentLogin } from './components/StudentLogin';
import { User, ShieldCheck } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<'student' | 'admin'>('student');
  const [studentId, setStudentId] = useState<string>('');

  useEffect(() => {
    const savedId = localStorage.getItem('school_student_id');
    if (savedId && savedId.length === 17) {
      setStudentId(savedId);
    }
  }, []);

  const handleEnterPortal = (id: string) => {
    setStudentId(id);
    localStorage.setItem('school_student_id', id);
  };

  const handleLogout = () => {
    setStudentId('');
    localStorage.removeItem('school_student_id');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        mode={mode}
        onToggleMode={setMode}
        studentId={studentId}
        onLogoutStudent={handleLogout}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === 'student' ? (
          !studentId ? (
            <StudentLogin onEnterPortal={handleEnterPortal} />
          ) : (
            <div className="space-y-6">
              {/* Active Student Banner */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">শিক্ষার্থী ড্যাশবোর্ড</h2>
                    <p className="text-xs text-slate-600 font-mono">
                      জন্ম নিবন্ধন: <span className="font-bold text-indigo-700">{studentId}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-colors"
                >
                  আইডি পরিবর্তন করুন
                </button>
              </div>

              {/* Placeholder for Student Dashboard Sections */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs">
                <p className="text-sm">
                  শিক্ষার্থী ড্যাশবোর্ডের পরবর্তী অংশসমূহ (চলমান আবেদন, ক্লাসের তালিকা এবং আবেদন হিস্টোরি) স্টেপ ৪-এ যুক্ত হবে।
                </p>
              </div>
            </div>
          )
        ) : (
          /* Admin View Container */
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-amber-900">অ্যাডমিন কন্ট্রোল প্যানেল</h2>
                <p className="text-xs text-amber-700">ক্লাস তৈরি ও আসন ব্যবস্থাপনার জন্য অ্যাডমিন মোড সক্রিয় রয়েছে।</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs">
              <p className="text-sm">
                অ্যাডমিন প্যানেলের উপাদানসমূহ (নতুন ক্লাস তৈরির ফর্ম ও লাইভ ক্লাস মনিটর) স্টেপ ৫-এ যুক্ত হবে।
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        School Admission System · First-Come, First-Served (FCFS) Admission Engine
      </footer>
    </div>
  );
}
