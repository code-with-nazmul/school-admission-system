import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StudentLogin } from './components/StudentLogin';
import { ActiveHoldCard } from './components/ActiveHoldCard';
import { ClassCard } from './components/ClassCard';
import { MyApplicationsTable } from './components/MyApplicationsTable';
import { AdminDashboard } from './components/AdminDashboard';
import { Toast, ToastMessage } from './components/Toast';
import { api, ApiClientError } from './api/client';
import { ClassItem, StudentHold } from './types';
import { User, RefreshCw } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<'student' | 'admin'>('student');
  const [studentId, setStudentId] = useState<string>('');

  // Data states
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [myHolds, setMyHolds] = useState<StudentHold[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast notification helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Restore saved session (Rule 11)
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

  // Fetch classes and student holds
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsInitialLoading(true);

    try {
      const classList = await api.getClasses();
      setClasses(classList);

      if (studentId) {
        const holds = await api.getMyHolds(studentId);
        setMyHolds(holds);
      }
    } catch (err: unknown) {
      if (!isSilent) {
        const message = err instanceof ApiClientError ? err.message : 'ডাটা লোড করা যায়নি।';
        showToast(message, 'error');
      }
    } finally {
      if (!isSilent) setIsInitialLoading(false);
    }
  }, [studentId, showToast]);

  // Initial fetch on mount & when studentId changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Rule 10: Auto-polling every 3 seconds to keep seat counts synchronized
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle Apply (Create Hold)
  const handleApply = async (classId: string) => {
    if (!studentId) return;
    setActionLoading(true);

    try {
      await api.createHold(classId, studentId);
      showToast('আসন সফলভাবে সংরক্ষিত হয়েছে! ১০ মিনিটের মধ্যে ভর্তি ফি পরিশোধ করুন।', 'success');
      await fetchData(true);
    } catch (err: unknown) {
      const message = err instanceof ApiClientError ? err.message : 'আবেদন করা সম্ভব হয়নি।';
      showToast(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Confirm (Pay Admission Fee)
  const handleConfirm = async (holdId: string) => {
    if (!studentId) return;
    setActionLoading(true);

    try {
      await api.confirmHold(holdId, studentId);
      showToast('অভিনন্দন! ভর্তি ফি সফলভাবে জমা হয়েছে এবং আপনার আসন নিশ্চিত করা হয়েছে।', 'success');
      await fetchData(true);
    } catch (err: unknown) {
      const message = err instanceof ApiClientError ? err.message : 'ভর্তি ফি প্রদান ব্যর্থ হয়েছে।';
      showToast(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel Hold
  const handleCancel = async (holdId: string) => {
    if (!studentId) return;
    setActionLoading(true);

    try {
      await api.cancelHold(holdId, studentId);
      showToast('আবেদনটি বাতিল করা হয়েছে এবং আসনটি উন্মুক্ত করা হয়েছে।', 'info');
      await fetchData(true);
    } catch (err: unknown) {
      const message = err instanceof ApiClientError ? err.message : 'বাতিল করা সম্ভব হয়নি।';
      showToast(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Create Class (Admin)
  const handleCreateClass = async (name: string, totalSeats: number, holdDurationSeconds?: number) => {
    setActionLoading(true);

    try {
      const created = await api.createClass({ name, totalSeats, holdDurationSeconds });
      showToast(`নতুন ক্লাস '${created.name}' (${created.id}) সফলভাবে তৈরি হয়েছে।`, 'success');
      await fetchData(true);
    } catch (err: unknown) {
      const message = err instanceof ApiClientError ? err.message : 'ক্লাস তৈরি সম্ভব হয়নি।';
      showToast(message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Find active held application
  const activeHold = myHolds.find(
    (h) => h.status === 'HELD' && new Date(h.expiresAt).getTime() > Date.now(),
  ) || myHolds.find((h) => h.status === 'HELD');

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
            <div className="space-y-8">
              {/* Active Student Header Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">শিক্ষার্থী ভর্তি ড্যাশবোর্ড</h2>
                    <p className="text-xs text-slate-500 font-mono">
                      জন্ম নিবন্ধন নম্বর: <span className="font-bold text-indigo-600">{studentId}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchData()}
                    disabled={actionLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                    <span>রিফ্রেশ</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
                  >
                    আইডি পরিবর্তন
                  </button>
                </div>
              </div>

              {/* Section 1: Active / Ongoing Hold Card */}
              {activeHold && (
                <section>
                  <ActiveHoldCard
                    hold={activeHold}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    isLoading={actionLoading}
                  />
                </section>
              )}

              {/* Section 2: Available Classes Grid */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">ভর্তির জন্য উপলব্ধ ক্লাসসমূহ</h3>
                    <p className="text-xs text-slate-500">আপনার পছন্দ অনুযায়ী ক্লাস ও শিফট নির্বাচন করুন</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    মোট ক্লাস: {classes.length}
                  </span>
                </div>

                {isInitialLoading && classes.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    <p className="text-sm font-medium">ক্লাসের তালিকা লোড হচ্ছে...</p>
                  </div>
                ) : classes.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                    <p className="text-sm font-medium">বর্তমানে কোনো ক্লাস উপলব্ধ নেই।</p>
                    <p className="text-xs text-slate-400 mt-1">অ্যাডমিন মোডে গিয়ে নতুন ক্লাস তৈরি করতে পারেন।</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {classes.map((cls) => {
                      const isConfirmed = myHolds.some(
                        (h) => h.classId === cls.id && h.status === 'CONFIRMED'
                      );
                      const heldHold = myHolds.find(
                        (h) =>
                          h.classId === cls.id &&
                          h.status === 'HELD' &&
                          new Date(h.expiresAt).getTime() > Date.now()
                      );

                      return (
                        <ClassCard
                          key={cls.id}
                          classItem={cls}
                          isConfirmedInThisClass={isConfirmed}
                          isHeldInThisClass={!!heldHold}
                          heldHoldId={heldHold?.holdId}
                          onApply={handleApply}
                          onConfirm={handleConfirm}
                          onCancel={handleCancel}
                          isLoading={actionLoading}
                        />
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Section 3: My Applications Table */}
              <section>
                <MyApplicationsTable holds={myHolds} />
              </section>
            </div>
          )
        ) : (
          /* Admin View Container */
          <AdminDashboard
            classes={classes}
            onCreateClass={handleCreateClass}
            isLoading={actionLoading}
            onRefresh={() => fetchData()}
          />
        )}
      </main>

      {/* Floating Toast Alerts (Rule 12) */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        School Admission System · First-Come, First-Served (FCFS) Admission Engine
      </footer>
    </div>
  );
}
