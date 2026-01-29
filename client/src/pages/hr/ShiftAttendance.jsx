import React, { useEffect, useMemo, useState } from 'react';
import { hrApi } from '../../api/hrApi';
import { Calendar, Clock3, Activity, AlertTriangle, Loader2 } from 'lucide-react';

const ShiftAttendance = () => {
  const [data, setData] = useState({ schedules: [], attendance: [], coverage: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await hrApi.getShiftAttendance();
        if (!mounted) return;
        setData(response?.data ?? {});
        setError(null);
      } catch (err) {
        console.error('Failed to load shift data', err);
        if (mounted) {
          setError('Attendance telemetry is unavailable. Please retry soon.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const coverage = useMemo(() => ({
    onTimeRate: data.coverage?.onTimeRate ?? 0,
    overtimeHours: data.coverage?.overtimeHours ?? 0,
    vacancies: data.coverage?.vacancies ?? 0,
  }), [data.coverage]);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Shift & attendance</h1>
        <p className="max-w-3xl text-sm text-gray-400">
          Monitor global coverage in real-time so SLA-bound teams never miss their staffing targets. Pull attendance
          deltas into ERP cost centres to reconcile overtime and vendor spend instantly.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 px-6 py-5 text-sm text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Loading scheduling coverage…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-100">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-semibold text-gray-200">On-time arrival</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{coverage.onTimeRate}%</p>
              <p className="mt-2 text-xs text-gray-500">Across monitored shifts over the last 7 days.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-blue-400" />
                <h2 className="text-sm font-semibold text-gray-200">Overtime logged</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{coverage.overtimeHours} hrs</p>
              <p className="mt-2 text-xs text-gray-500">High overtime can trigger payroll adjustments.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-300" />
                <h2 className="text-sm font-semibold text-gray-200">Open vacancies</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{coverage.vacancies}</p>
              <p className="mt-2 text-xs text-gray-500">Backfills required to maintain SLA compliance.</p>
            </article>
          </div>

          <section className="grid gap-6 lg:grid-cols-[1.8fr_1.2fr]">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Shift coverage</h2>
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
                  <Calendar className="h-3.5 w-3.5" />
                  {(data.schedules || []).length} schedules
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {(data.schedules || []).map((schedule) => (
                  <article key={schedule.id} className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
                    <div className="flex items-center justify-between text-sm text-gray-200">
                      <span className="font-semibold text-white">{schedule.team}</span>
                      <span className="text-xs text-gray-500">Coverage {schedule.coverage}%</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Lead • {schedule.shift_lead}</p>
                    {schedule.notes && <p className="mt-3 text-xs text-gray-400">{schedule.notes}</p>}
                  </article>
                ))}
              </div>
            </div>

            <aside className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <h2 className="text-lg font-semibold text-white">Attendance log</h2>
              <div className="mt-4 space-y-4">
                {(data.attendance || []).map((entry) => (
                  <article key={entry.id} className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-white">{entry.employee_name}</span>
                      <span className="text-xs text-gray-500">{entry.shift_date}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Status • {entry.status}</p>
                    <p className="mt-2 text-xs text-gray-400">Variance {entry.variance_minutes} mins</p>
                  </article>
                ))}
              </div>
            </aside>
          </section>
        </>
      )}
    </section>
  );
};

export default ShiftAttendance;
