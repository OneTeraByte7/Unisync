import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarClock,
  Handshake,
  ClipboardList,
  Building2,
  GaugeCircle,
  ArrowRight,
  Briefcase,
  Package,
  Target,
  TrendingUp,
} from 'lucide-react';
import { hrApi } from '../../api/hrApi';

const INTEGRATION_LINKS = [
  {
    icon: Package,
    title: 'Sync workforce with ERP vendors',
    description: 'Map contractors to supplier profiles and track onboarding docs alongside purchase orders.',
    to: '/erp/suppliers',
    cta: 'Open ERP suppliers',
  },
  {
    icon: Briefcase,
    title: 'Align hiring to pipeline in CRM',
    description: 'Share headcount signals with sales leaders so hiring plans mirror opportunity volume.',
    to: '/crm/deals',
    cta: 'Review CRM deals',
  },
  {
    icon: Building2,
    title: 'Roll up workforce analytics',
    description: 'Surface HR health next to executive dashboards so finance and operations stay in lockstep.',
    to: '/erp/reports',
    cta: 'View ERP reports',
  },
];

const PLAYBOOKS = [
  {
    title: 'Plan a new hire cohort',
    steps: [
      'Check CRM pipeline velocity to forecast headcount demand.',
      'Log requisitions here and auto-share with ERP procurement.',
      'Auto-create onboarding tasks when offers are accepted.',
    ],
  },
  {
    title: 'Prepare for quarter close',
    steps: [
      'Confirm time-off balances before locking payroll.',
      'Sync contractor hours with ERP accounting ledgers.',
      'Share performance snapshots with sales leadership in CRM.',
    ],
  },
];

const HrDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await hrApi.getDashboardSummary();
        if (!mounted) return;
        setSummary(response?.data ?? null);
        setError(null);
      } catch (err) {
        console.error('Failed to load HR dashboard summary', err);
        if (mounted) {
          setError('Unable to fetch live HR metrics. Showing playbooks only.');
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

  const statCards = useMemo(
    () => [
      {
        icon: Users,
        title: 'Headcount',
        metric: summary?.headcount ? `${summary.headcount} employees` : '—',
        helper: 'Active employees across regions',
      },
      {
        icon: Briefcase,
        title: 'Open roles',
        metric: summary?.openRoles !== undefined ? `${summary.openRoles} requisitions` : '—',
        helper: 'Sourced from recruitment workspace',
      },
      {
        icon: Handshake,
        title: 'Pending offers',
        metric: summary?.pendingOffers !== undefined ? `${summary.pendingOffers}` : '—',
        helper: 'Candidates awaiting acceptance',
      },
      {
        icon: ClipboardList,
        title: 'Engagement score',
        metric: summary?.engagementScore !== undefined ? `${summary.engagementScore}%` : '—',
        helper: 'Latest pulse survey results',
      },
    ],
    [summary]
  );

  const statusHighlights = useMemo(
    () => [
      {
        label: 'Average time to hire',
        value: summary?.hiringVelocity ? `${summary.hiringVelocity} days` : '—',
        icon: CalendarClock,
      },
      {
        label: 'Attrition YTD',
        value: summary?.attritionRate ? `${summary.attritionRate}%` : '—',
        icon: Target,
      },
      {
        label: 'Upcoming actions',
        value: `${summary?.upcomingActions?.length ?? 0} queued`,
        icon: TrendingUp,
      },
    ],
    [summary]
  );

  return (
    <section className="space-y-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/70">People operations</p>
          <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Connected workforce hub</h1>
          <p className="mt-3 max-w-2xl text-sm text-gray-400 sm:text-base">
            HR, ERP, and CRM stay in lockstep—share onboarding progress with finance, mirror headcount plans to sales,
            and keep leadership aligned in one workspace.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-100 sm:max-w-xs">
          <div className="inline-flex items-center gap-2 text-emerald-200">
            <GaugeCircle className="h-4 w-4" />
            Live metrics
          </div>
          {loading ? (
            <p className="text-xs text-emerald-200/70">Fetching HR telemetry…</p>
          ) : error ? (
            <p className="text-xs text-emerald-200/70">{error}</p>
          ) : (
            <ul className="space-y-3 text-emerald-100/90">
              {statusHighlights.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.label} className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-200">
                      <IconComponent className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-[0.18em] text-emerald-200/70">{item.label}</span>
                      <span className="text-sm font-semibold text-emerald-50">{item.value}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-xs text-emerald-200/70">
            Data syncs from HR recruitment, payroll, and engagement touchpoints to keep operations decisions aligned.
          </p>
        </div>
      </header>

      {!error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <article
                key={card.title}
                className="group flex flex-col gap-3 rounded-2xl border border-gray-800 bg-gray-900/70 p-6 transition hover:border-emerald-500/40 hover:bg-gray-900"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                    <IconComponent className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-white">{card.title}</h2>
                    <p className="text-xs text-gray-400">{card.helper}</p>
                  </div>
                </div>
                <p className="text-2xl font-semibold text-white">{card.metric}</p>
              </article>
            );
          })}
        </div>
      )}

      {summary?.upcomingActions?.length > 0 && !error && (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-100">
          <h2 className="flex items-center gap-2 text-base font-semibold text-emerald-200">
            <ClipboardList className="h-4 w-4" />
            Upcoming actions
          </h2>
          <ul className="mt-4 space-y-2 text-emerald-100/80">
            {summary.upcomingActions.map((action) => (
              <li key={action.id} className="flex items-center justify-between gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-emerald-100">{action.title}</p>
                  <p className="text-xs text-emerald-200/70">Owner • {action.owner}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.25em] text-emerald-200/70">Due {action.due_on}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">How HR, ERP & CRM work together</h2>
          <p className="text-sm text-gray-400">
            Every integration card jumps directly into the workspace that powers the process so teams can resolve issues
            without context switching.
          </p>
          <div className="space-y-4">
            {INTEGRATION_LINKS.map((link) => {
              const IconComponent = link.icon;
              return (
                <div
                  key={link.title}
                  className="flex flex-col gap-3 rounded-xl border border-gray-800/70 bg-gray-900/80 p-4 transition hover:border-emerald-500/40 hover:bg-gray-900"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
                      <IconComponent className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">{link.title}</h3>
                      <p className="text-sm text-gray-400">{link.description}</p>
                    </div>
                  </div>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300 hover:text-emerald-200"
                  >
                    {link.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Playbooks</h2>
          <p className="text-sm text-gray-400">Guided workflows that propagate updates to CRM and ERP automatically.</p>

          <div className="space-y-4">
            {PLAYBOOKS.map((playbook) => (
              <div key={playbook.title} className="rounded-xl border border-gray-800/70 bg-gray-900/70 p-4">
                <h3 className="text-sm font-semibold text-white">{playbook.title}</h3>
                <ol className="mt-2 space-y-2 text-xs text-gray-400">
                  {playbook.steps.map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-emerald-500/10 text-center text-[0.65rem] font-semibold text-emerald-200">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-100">
            Changes here instantly sync to ERP organizations and CRM account plans. Everyone stays aligned.
          </div>
        </aside>
      </div>
    </section>
  );
};

export default HrDashboard;
