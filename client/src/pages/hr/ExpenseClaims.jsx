import React, { useEffect, useMemo, useState } from 'react';
import { hrApi } from '../../api/hrApi';
import { Receipt, Wallet, PiggyBank, Loader2 } from 'lucide-react';

const ExpenseClaims = () => {
  const [data, setData] = useState({ claims: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await hrApi.getExpenseClaims();
        if (!mounted) return;
        setData(response?.data ?? {});
        setError(null);
      } catch (err) {
        console.error('Failed to fetch expense claims', err);
        if (mounted) {
          setError('Expense workflow is unreachable right now. Try again shortly.');
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
      monthToDate: data.totals?.monthToDate ?? 0,
      pending: data.totals?.pending ?? 0,
      reimbursed: data.totals?.reimbursed ?? 0,
    }),
    [data.totals]
  );

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Expense claims</h1>
        <p className="max-w-3xl text-sm text-gray-400">
          Give finance and HR a shared ledger of reimbursements, campaign spend, and offsite budgets. Every entry is
          structured for export to ERP so nothing slips between spreadsheets.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 px-6 py-5 text-sm text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Syncing latest reimbursements…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-100">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-semibold text-gray-200">Month-to-date</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">${totals.monthToDate.toLocaleString()}</p>
              <p className="mt-2 text-xs text-gray-500">Total spend captured in the current month.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <Receipt className="h-5 w-5 text-blue-400" />
                <h2 className="text-sm font-semibold text-gray-200">Pending approval</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">${totals.pending.toLocaleString()}</p>
              <p className="mt-2 text-xs text-gray-500">Items awaiting manager or finance sign-off.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <PiggyBank className="h-5 w-5 text-purple-400" />
                <h2 className="text-sm font-semibold text-gray-200">Reimbursed</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">${totals.reimbursed.toLocaleString()}</p>
              <p className="mt-2 text-xs text-gray-500">Approved and processed reimbursements.</p>
            </article>
          </div>

          <section className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">Claim register</h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                {(data.claims || []).length} entries
              </span>
            </div>
            <div className="mt-5 overflow-hidden rounded-xl border border-gray-800">
              <table className="min-w-full divide-y divide-gray-800 text-sm text-gray-200">
                <thead className="bg-gray-900/80 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Employee</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900">
                  {(data.claims || []).map((claim) => (
                    <tr key={claim.id} className="transition hover:bg-gray-900/60">
                      <td className="px-4 py-3 font-medium text-white">{claim.employee_name}</td>
                      <td className="px-4 py-3 text-gray-300">{claim.category}</td>
                      <td className="px-4 py-3 text-gray-200">${Number(claim.amount ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-medium text-blue-200">
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{claim.submitted_on}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </section>
  );
};

export default ExpenseClaims;
