import React, { useEffect, useState } from 'react';
import { hrApi } from '../../api/hrApi';
import { RefreshCw, CalendarCheck2, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';

const STATUS_COLORS = {
  'In progress': 'bg-blue-500/10 text-blue-200 border border-blue-500/30',
  Planned: 'bg-gray-500/10 text-gray-200 border border-gray-500/30',
  Completed: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30',
};

const EmployeeLifecycle = () => {
  const [data, setData] = useState({ events: [], milestones: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await hrApi.getEmployeeLifecycle();
        if (!mounted) return;
        setData(response?.data ?? {});
        setError(null);
      } catch (err) {
        console.error('Failed to load lifecycle data', err);
        if (mounted) {
          setError('We could not reach the employee lifecycle timeline. Please try again shortly.');
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
        <h1 className="text-3xl font-bold text-white">Employee lifecycle</h1>
        <p className="max-w-3xl text-sm text-gray-400">
          Understand every touchpoint as employees transition through onboarding, promotions, internal mobility, and
          offboarding. Pair this view with ERP and CRM integrations so workforce moves align to revenue pacing.
        </p>
      </header>

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 px-6 py-5 text-sm text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Building lifecycle stream…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-100">{error}</div>
      ) : (
        <>
          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Lifecycle timeline</h2>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Live sync
                </span>
              </div>
              <div className="mt-6 space-y-6">
                {(data.events || []).map((event) => (
                  <article key={event.id} className="relative pl-6">
                    <span className="absolute left-0 top-2 h-3 w-3 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500" />
                    <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
                      <div className="flex items-center justify-between text-sm text-gray-300">
                        <span className="font-semibold text-white">{event.employee_name}</span>
                        <span className="text-xs text-gray-500">{event.effective_date}</span>
                      </div>
                      <p className="mt-2 text-sm text-gray-300">{event.event_type}</p>
                      {event.notes && <p className="mt-2 text-xs text-gray-500">{event.notes}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="space-y-4 rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <CalendarCheck2 className="h-5 w-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Milestones</h2>
              </div>
              <div className="space-y-4">
                {(data.milestones || []).map((milestone) => (
                  <article key={milestone.id} className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
                    <p className="text-sm font-semibold text-white">{milestone.title}</p>
                    <p className="mt-1 text-xs text-gray-500">Owner • {milestone.owner}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-800 px-2.5 py-1 text-gray-300">
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                        Due {milestone.due_on}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${STATUS_COLORS[milestone.status] || 'bg-gray-800 text-gray-300'}`}>
                        <AlertTriangle className="h-3 w-3" />
                        {milestone.status}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-100">
                Connect lifecycle events with payroll and IT provisioning workflows so every transition triggers the
                right downstream checklist automatically.
              </p>
            </aside>
          </section>
        </>
      )}
    </section>
  );
};

export default EmployeeLifecycle;
