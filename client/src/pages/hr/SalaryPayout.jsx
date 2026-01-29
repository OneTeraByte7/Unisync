import React, { useEffect, useState } from 'react';
import { hrApi } from '../../api/hrApi';
import { CalendarRange, Banknote, Loader2 } from 'lucide-react';

const SalaryPayout = () => {
  const [data, setData] = useState({ runs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await hrApi.getPayrollRuns();
        if (!mounted) return;
        setData(response?.data ?? {});
        setError(null);
      } catch (err) {
        console.error('Failed to load salary payout data', err);
        if (mounted) {
          setError('Salary payout history is unavailable right now.');
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

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Salary payout</h1>
        <p className="max-w-3xl text-sm text-gray-400">
          Track the full lifecycle of payroll runs: approvals, disbursement dates, and headcount coverage. Export a
          ledger-ready file for finance in one click.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 px-6 py-5 text-sm text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Loading salary cycles…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-100">{error}</div>
      ) : (
        <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CalendarRange className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Payroll runs</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
              {(data.runs || []).length} recorded
            </span>
          </div>
          <div className="mt-5 overflow-hidden rounded-xl border border-gray-800">
            <table className="min-w-full divide-y divide-gray-800 text-sm text-gray-200">
              <thead className="bg-gray-900/80 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Cycle</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Disbursement</th>
                  <th className="px-4 py-3 text-left">Headcount</th>
                  <th className="px-4 py-3 text-left">Net pay</th>
                  <th className="px-4 py-3 text-left">Total taxes</th>
                  <th className="px-4 py-3 text-left">Adjustments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900">
                {(data.runs || []).map((run) => (
                  <tr key={run.id} className="transition hover:bg-gray-900/60">
                    <td className="px-4 py-3 font-semibold text-white">{run.cycle}</td>
                    <td className="px-4 py-3 text-gray-300">{run.status}</td>
                    <td className="px-4 py-3 text-gray-300">{run.disbursement_date}</td>
                    <td className="px-4 py-3 text-gray-300">{run.headcount}</td>
                    <td className="px-4 py-3 text-gray-200">${Number(run.net_pay ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-200">${Number(run.total_taxes ?? 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-300">{run.adjustments_summary || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Banknote className="h-3.5 w-3.5 text-emerald-400" />
            Tie each run to ERP ledger codes automatically using the Supabase functions defined in the schema below.
          </p>
        </section>
      )}
    </section>
  );
};

export default SalaryPayout;
