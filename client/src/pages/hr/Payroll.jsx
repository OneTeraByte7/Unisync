import React, { useEffect, useMemo, useState } from 'react';
import { hrApi } from '../../api/hrApi';
import { Wallet, Coins, AlertCircle, Loader2 } from 'lucide-react';

const Payroll = () => {
  const [data, setData] = useState({ runs: [], totals: {}, progress: {}, alerts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await hrApi.getPayrollSummary();
        if (!mounted) return;
        setData(response?.data ?? {});
        setError(null);
      } catch (err) {
        console.error('Failed to load payroll summary', err);
        if (mounted) {
          setError('Payroll cockpit is offline right now.');
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

  const totals = useMemo(
    () => ({
      netPay: data.totals?.netPay ?? 0,
      taxes: data.totals?.taxes ?? 0,
      benefits: data.totals?.benefits ?? 0,
    }),
    [data.totals]
  );

  const progress = useMemo(
    () => ({
      currentStep: data.progress?.currentStep ?? '—',
      nextCutoff: data.progress?.nextCutoff ?? '—',
      riskLevel: data.progress?.riskLevel ?? '—',
    }),
    [data.progress]
  );

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Payroll overview</h1>
        <p className="max-w-3xl text-sm text-gray-400">
          Run salary, contractor, and bonus payouts with full audit visibility. Trigger checklist templates, compare net
          pay trends, and sync ledger entries to accounting instantly.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 px-6 py-5 text-sm text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Pulling payroll telemetry…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-100">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-semibold text-gray-200">Net pay</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">${totals.netPay.toLocaleString()}</p>
              <p className="mt-2 text-xs text-gray-500">Aggregate net salary across latest cycles.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <Coins className="h-5 w-5 text-blue-400" />
                <h2 className="text-sm font-semibold text-gray-200">Taxes</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">${totals.taxes.toLocaleString()}</p>
              <p className="mt-2 text-xs text-gray-500">Withholdings due to revenue finance.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-purple-400" />
                <h2 className="text-sm font-semibold text-gray-200">Benefits</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">${totals.benefits.toLocaleString()}</p>
              <p className="mt-2 text-xs text-gray-500">Employer-paid benefits across programs.</p>
            </article>
          </div>

          <section className="grid gap-6 lg:grid-cols-[1.8fr_1.2fr]">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Recent payroll runs</h2>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  {(data.runs || []).length} cycles
                </span>
              </div>
              <div className="mt-5 overflow-hidden rounded-xl border border-gray-800">
                <table className="min-w-full divide-y divide-gray-800 text-sm text-gray-200">
                  <thead className="bg-gray-900/80 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Cycle</th>
                      <th className="px-4 py-3 text-left">Disbursement</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Headcount</th>
                      <th className="px-4 py-3 text-left">Net pay</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900">
                    {(data.runs || []).map((run) => (
                      <tr key={run.id} className="transition hover:bg-gray-900/60">
                        <td className="px-4 py-3 font-semibold text-white">{run.cycle}</td>
                        <td className="px-4 py-3 text-gray-300">{run.disbursement_date}</td>
                        <td className="px-4 py-3 text-gray-200">{run.status}</td>
                        <td className="px-4 py-3 text-gray-300">{run.headcount}</td>
                        <td className="px-4 py-3 text-gray-200">${Number(run.net_pay ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <h2 className="text-lg font-semibold text-white">Run status</h2>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4 text-sm text-gray-200">
                  <p className="font-semibold text-white">Current step</p>
                  <p className="mt-1 text-xs text-gray-500">{progress.currentStep}</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4 text-sm text-gray-200">
                  <p className="font-semibold text-white">Next cutoff</p>
                  <p className="mt-1 text-xs text-gray-500">{progress.nextCutoff}</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4 text-sm text-gray-200">
                  <p className="font-semibold text-white">Risk level</p>
                  <p className="mt-1 text-xs text-gray-500">{progress.riskLevel}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {(data.alerts || []).map((alert) => (
                  <article key={alert.id} className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-100">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4" />
                      {alert.severity?.toUpperCase()} priority
                    </div>
                    <p className="mt-2 text-amber-100/80">{alert.message}</p>
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

export default Payroll;
