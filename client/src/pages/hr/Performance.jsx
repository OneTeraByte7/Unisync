import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Star, Sparkles, TrendingUp, ArrowRight, ClipboardCheck, Users } from 'lucide-react';

const REVIEW_CYCLES = [
  {
    id: 'Q4-REV',
    focus: 'Revenue team quarterly review',
    progress: 72,
    due: 'Due in 9 days',
    crmCallout: 'Sync coaching notes from CRM pipeline reviews.',
  },
  {
    id: 'OPS-RETRO',
    focus: 'Operations post-implementation retro',
    progress: 38,
    due: 'Due in 15 days',
    erpCallout: 'Ingest ERP ticket resolution metrics for quality scores.',
  },
  {
    id: 'PEOPLE-DEVS',
    focus: 'People org development plans',
    progress: 54,
    due: 'Due in 21 days',
    crmCallout: 'Highlight top performers closing CRM deals.',
  },
];

const Performance = () => {
  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Performance & growth</h1>
          <p className="text-sm text-gray-400">
            Bridge the gap between sales achievements, operational excellence, and people development.
          </p>
        </div>
        <Link
          to="/crm/reports"
          className="inline-flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-200 transition hover:border-blue-500/60 hover:bg-blue-500/20"
        >
          Review CRM scorecards
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
          <div className="flex items-center gap-3 text-gray-300">
            <Target className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">Goal attainment</h2>
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">68%</p>
          <p className="text-sm text-gray-400">Across current review cycle—auto pulls from CRM quota data.</p>
        </article>
        <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
          <div className="flex items-center gap-3 text-gray-300">
            <Star className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-semibold text-white">Shoutouts</h2>
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">14</p>
          <p className="text-sm text-gray-400">Managers recognized teammates based on ERP delivery milestones.</p>
        </article>
        <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
          <div className="flex items-center gap-3 text-gray-300">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h2 className="text-base font-semibold text-white">Growth plans</h2>
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">11 active</p>
          <p className="text-sm text-gray-400">Stretch projects tracked across ERP operations squads.</p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80">
          <table className="min-w-full divide-y divide-gray-800 text-sm">
            <thead className="bg-gray-900/90 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left">Review cycle</th>
                <th className="px-5 py-3 text-left">Progress</th>
                <th className="px-5 py-3 text-left">Due</th>
                <th className="px-5 py-3 text-left">Cross-suite insight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {REVIEW_CYCLES.map((cycle) => (
                <tr key={cycle.id} className="transition hover:bg-gray-900/60">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{cycle.focus}</div>
                    <div className="text-xs text-gray-500">{cycle.id}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-300">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-full rounded-full bg-gray-800">
                        <div
                          className="h-2 rounded-full bg-emerald-400"
                          style={{ width: `${cycle.progress}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs text-gray-400">{cycle.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{cycle.due}</td>
                  <td className="px-5 py-4 text-sm text-gray-300">{cycle.crmCallout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/70 p-6 text-sm text-gray-300">
          <div>
            <h2 className="text-base font-semibold text-white">Feed insights everywhere</h2>
            <p className="mt-2 text-sm text-gray-400">
              Publish one set of performance metrics that cascades to CRM dashboards and ERP leadership briefings.
            </p>
          </div>
          <Link
            to="/erp/reports"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-500/50 hover:bg-emerald-500/15"
          >
            View ERP analytics
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/crm"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-100 transition hover:border-blue-500/50 hover:bg-blue-500/15"
          >
            Sync with CRM dashboards
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4 text-xs text-gray-400">
            <p className="font-medium text-gray-200">Need collaborators?</p>
            <p className="mt-2">
              Partner with frontline managers and operations leaders to align goals. Track ownership directly in the
              people directory.
            </p>
            <Link to="/hr/employees" className="mt-3 inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200">
              Open directory
              <Users className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>

      <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 text-sm text-purple-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-purple-200">
            <TrendingUp className="h-5 w-5" />
            <p className="text-base font-semibold text-white">Close the loop with revenue & operations</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/crm/organizations"
              className="inline-flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/20 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500/30"
            >
              Map to key accounts
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/erp/quality"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500/30"
            >
              Share ops feedback
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Performance;
