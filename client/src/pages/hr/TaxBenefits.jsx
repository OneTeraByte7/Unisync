import React, { useEffect, useState } from 'react';
import { hrApi } from '../../api/hrApi';
import { Scale, HeartHandshake, Loader2 } from 'lucide-react';

const TaxBenefits = () => {
  const [data, setData] = useState({ benefits: [], adjustments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await hrApi.getPayrollBenefits();
        if (!mounted) return;
        setData(response?.data ?? {});
        setError(null);
      } catch (err) {
        console.error('Failed to load benefits data', err);
        if (mounted) {
          setError('Tax & benefits registry is offline for a moment.');
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
        <h1 className="text-3xl font-bold text-white">Tax & benefits</h1>
        <p className="max-w-3xl text-sm text-gray-400">
          Centralize employer-paid benefits, pre-tax deductions, and compliance adjustments. Feed these directly into the
          payroll engine without manual uploads.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 px-6 py-5 text-sm text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Compiling benefits ledger…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-100">{error}</div>
      ) : (
        <>
          <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <HeartHandshake className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Benefit programs</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                {(data.benefits || []).length} active
              </span>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {(data.benefits || []).map((benefit) => (
                <article key={benefit.id} className="rounded-xl border border-gray-800 bg-gray-950/70 p-5 text-sm text-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{benefit.name}</span>
                    <span className="text-xs text-gray-500">Owner • {benefit.owner}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Enrollment • {benefit.enrollment} people</p>
                  <p className="mt-2 text-xs text-gray-400">Monthly cost • ${Number(benefit.cost_monthly ?? 0).toLocaleString()}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
            <div className="flex items-center gap-3">
              <Scale className="h-5 w-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Compliance adjustments</h2>
            </div>
            <div className="mt-4 space-y-3">
              {(data.adjustments || []).map((adjustment) => (
                <article key={adjustment.id} className="rounded-xl border border-gray-800 bg-gray-950/70 p-4 text-sm text-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{adjustment.reason}</span>
                    <span className="text-xs text-gray-500">Effective {adjustment.effective_date}</span>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Amount • ${Number(adjustment.amount ?? 0).toLocaleString()}</p>
                  {adjustment.notes && <p className="mt-2 text-xs text-gray-500">{adjustment.notes}</p>}
                </article>
              ))}
              {(data.adjustments || []).length === 0 && (
                <p className="rounded-xl border border-gray-800 bg-gray-950/70 p-4 text-xs text-gray-500">
                  No adjustments recorded in the last cycle.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </section>
  );
};

export default TaxBenefits;
