import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  RefreshCcw,
  LineChart,
  TrendingUp,
  Handshake,
  CalendarClock,
  Users,
  Building2,
  NotebookPen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { crmDashboardApi } from '../../api/crmApi';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const CHART_COLORS = ['#22c55e', '#38bdf8', '#f97316', '#a855f7', '#eab308', '#ec4899', '#0ea5e9', '#14b8a6'];

const formatCurrency = (value) => currencyFormatter.format(Math.max(0, Number(value) || 0));
const formatCount = (value) => numberFormatter.format(Math.max(0, Number(value) || 0));

const formatRelativeTime = (value) => {
  if (!value) return 'No notes logged yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No notes logged yet';

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return 'Just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const SummaryCard = ({ title, value, subtitle, icon: Icon, accentClass }) => (
  <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-5 flex flex-col gap-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-medium text-gray-400">{title}</p>
      {Icon && (
        <span
          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${
            accentClass || 'from-emerald-500/30 to-blue-500/30 text-emerald-300'
          }`}
        >
          <Icon className="h-5 w-5 text-white" />
        </span>
      )}
    </div>
    <div className="space-y-1">
      <p className="text-3xl font-semibold text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const ChartCard = ({ title, description, className, children }) => (
  <div
    className={`rounded-2xl border border-gray-800 bg-gray-900/70 p-5 flex flex-col ${
      className ? className : ''
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
    </div>
    <div className="mt-6 flex-1">
      {children}
    </div>
  </div>
);

const ChartEmptyState = ({ message }) => (
  <div className="flex h-48 items-center justify-center text-sm text-gray-500">{message}</div>
);

const tooltipTheme = {
  contentStyle: {
    backgroundColor: '#0f172a',
    borderColor: '#1f2937',
    borderRadius: '0.75rem',
    color: '#e5e7eb',
  },
};

const CrmDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await crmDashboardApi.getSummary();
      if (response?.success !== false && response?.data) {
        setSummary(response.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(response?.error || 'Unable to load CRM metrics');
      }
    } catch (err) {
      console.error('Failed to load CRM summary', err);
      setError(err?.response?.data?.error || err?.message || 'Unable to load CRM metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const isInitialLoad = loading && !summary;
  const noData = !loading && !error && (!summary || Object.keys(summary || {}).length === 0);

  const primaryStats = useMemo(() => {
    if (!summary) return [];
    return [
      {
        title: 'Total Pipeline',
        value: formatCurrency(summary.deals?.pipelineValue),
        subtitle: `${formatCount(summary.deals?.total)} active deals`,
        icon: LineChart,
        accentClass: 'from-emerald-500/30 via-emerald-500/10 to-blue-500/30',
      },
      {
        title: 'Weighted Forecast',
        value: formatCurrency(summary.deals?.weightedPipeline),
        subtitle: 'Probability-adjusted pipeline',
        icon: TrendingUp,
        accentClass: 'from-sky-500/30 via-sky-500/10 to-blue-500/30',
      },
      {
        title: 'Closing Next 30 Days',
        value: formatCount(summary.deals?.closingNext30Days),
        subtitle: 'Deals with close dates in 30 days',
        icon: CalendarClock,
        accentClass: 'from-amber-500/30 via-amber-500/10 to-rose-500/30',
      },
      {
        title: 'Total Leads',
        value: formatCount(summary.leads?.total),
        subtitle: `${formatCount(summary.contacts?.total)} contacts on file`,
        icon: Handshake,
        accentClass: 'from-purple-500/30 via-purple-500/10 to-indigo-500/30',
      },
    ];
  }, [summary]);

  const secondaryStats = useMemo(() => {
    if (!summary) return [];
    return [
      {
        title: 'Leads w/ Owners',
        value: formatCount(summary.contacts?.withOwner),
        subtitle: `${formatCount(summary.contacts?.total)} total contacts`,
        icon: Users,
        accentClass: 'from-emerald-500/30 via-emerald-500/10 to-teal-500/30',
      },
      {
        title: 'Unlinked Contacts',
        value: formatCount(summary.contacts?.withoutOrganization),
        subtitle: 'Contacts without an organization record',
        icon: Users,
        accentClass: 'from-rose-500/30 via-rose-500/10 to-orange-500/30',
      },
      {
        title: 'Organizations',
        value: formatCount(summary.organizations?.total),
        subtitle: `${formatCount(summary.leads?.statusBreakdown?.length || 0)} lead statuses tracked`,
        icon: Building2,
        accentClass: 'from-blue-500/30 via-blue-500/10 to-indigo-500/30',
      },
      {
        title: 'Notes Logged',
        value: formatCount(summary.notes?.total),
        subtitle: formatRelativeTime(summary.notes?.lastActivityAt),
        icon: NotebookPen,
        accentClass: 'from-fuchsia-500/30 via-fuchsia-500/10 to-pink-500/30',
      },
    ];
  }, [summary]);

  const leadStatusData = useMemo(() => {
    if (!summary?.leads?.statusBreakdown) return [];
    return summary.leads.statusBreakdown
      .map((item) => ({
        ...item,
        count: Number(item.count) || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [summary]);

  const leadSourceData = useMemo(() => {
    if (!summary?.leads?.sourceBreakdown) return [];
    return summary.leads.sourceBreakdown
      .map((item, index) => ({
        ...item,
        count: Number(item.count) || 0,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [summary]);

  const dealStageData = useMemo(() => {
    if (!summary?.deals?.stageBreakdown) return [];
    return summary.deals.stageBreakdown
      .map((item) => ({
        stage: item.stage,
        value: Number(item.value) || 0,
        count: Number(item.count) || 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [summary]);

  const organizationStatusData = useMemo(() => {
    if (!summary?.organizations?.statusBreakdown) return [];
    return summary.organizations.statusBreakdown
      .map((item) => ({
        status: item.status,
        count: Number(item.count) || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [summary]);

  const industryData = useMemo(() => {
    if (!summary?.organizations?.industryBreakdown) return [];
    return summary.organizations.industryBreakdown
      .map((item) => ({
        industry: item.industry,
        count: Number(item.count) || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [summary]);

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">CRM Dashboard</h1>
          <p className="text-gray-400">
            Monitor pipeline health, lead velocity, and customer touchpoints in one place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && !loading && (
            <span className="rounded-full border border-gray-800 bg-gray-900/70 px-3 py-1 text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            type="button"
            onClick={loadSummary}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/70 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Refresh
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-800 bg-red-900/20 p-5 text-sm text-red-200">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-red-300">{error}</p>
              <p className="mt-1 text-red-200/80">Retry once your Supabase connection is ready.</p>
            </div>
            <button
              type="button"
              onClick={loadSummary}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-100 hover:bg-red-500/30"
            >
              <RefreshCcw className="h-3 w-3" /> Retry
            </button>
          </div>
        </div>
      )}

      {isInitialLoad && (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/70 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-3 text-sm">Loading CRM insights…</span>
        </div>
      )}

      {noData && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 text-sm text-gray-400">
          No CRM activity yet. Create leads, deals, or notes to see analytics populate automatically.
        </div>
      )}

      {!isInitialLoad && summary && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {primaryStats.map((card) => (
              <SummaryCard key={card.title} {...card} />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {secondaryStats.map((card) => (
              <SummaryCard key={card.title} {...card} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard
              title="Deal Stage Pipeline"
              description="Pipeline value by stage"
              className="lg:col-span-2"
            >
              {dealStageData.length === 0 ? (
                <ChartEmptyState message="Log deals with values to see stage distribution." />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dealStageData}>
                    <CartesianGrid stroke="#1f2937" strokeDasharray="4 8" vertical={false} />
                    <XAxis dataKey="stage" stroke="#7f8ea3" tickLine={false} axisLine={false} />
                    <YAxis stroke="#7f8ea3" tickFormatter={formatCurrency} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltipTheme} formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#38bdf8" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Lead Sources" description="Where new business originates">
              {leadSourceData.length === 0 ? (
                <ChartEmptyState message="Capture lead sources to visualise acquisition mix." />
              ) : (
                <div className="flex h-72 flex-col gap-6 md:flex-row">
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={leadSourceData}
                          dataKey="count"
                          nameKey="source"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={4}
                        >
                          {leadSourceData.map((entry) => (
                            <Cell key={entry.source} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          {...tooltipTheme}
                          formatter={(value, _name, item) => [formatCount(value), item?.payload?.source]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-3">
                    {leadSourceData.map((source) => (
                      <div key={source.source} className="flex items-center justify-between text-sm text-gray-300">
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: source.fill }}
                          />
                          {source.source}
                        </span>
                        <span className="font-semibold text-white">{formatCount(source.count)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ChartCard title="Lead Status" description="Count of leads per status" className="lg:col-span-2">
              {leadStatusData.length === 0 ? (
                <ChartEmptyState message="Keep adding leads to see status progression." />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={leadStatusData}>
                    <CartesianGrid stroke="#1f2937" strokeDasharray="4 8" vertical={false} />
                    <XAxis dataKey="status" stroke="#7f8ea3" tickLine={false} axisLine={false} />
                    <YAxis stroke="#7f8ea3" allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip {...tooltipTheme} formatter={(value) => formatCount(value)} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Organizations by Status" description="Account lifecycle distribution">
              {organizationStatusData.length === 0 ? (
                <ChartEmptyState message="Associate organizations to deals to see lifecycle trends." />
              ) : (
                <div className="space-y-4">
                  {organizationStatusData.map((item) => (
                    <div key={item.status} className="flex items-center justify-between rounded-xl bg-gray-900/60 px-3 py-2">
                      <span className="text-sm text-gray-300">{item.status}</span>
                      <span className="text-sm font-semibold text-white">{formatCount(item.count)}</span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Top Industries" description="Where your accounts operate">
              {industryData.length === 0 ? (
                <ChartEmptyState message="Tag organizations with industries to surface insights." />
              ) : (
                <div className="space-y-3">
                  {industryData.map((item) => (
                    <div
                      key={item.industry}
                      className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/70 px-4 py-3"
                    >
                      <span className="text-sm text-gray-300">{item.industry}</span>
                      <span className="text-sm font-semibold text-white">{formatCount(item.count)}</span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>

            <ChartCard title="Engagement Activity" description="Recent notes and interactions">
              <div className="flex h-full flex-col justify-between gap-4">
                <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                  <p className="text-xs uppercase tracking-widest text-emerald-300">Last note logged</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatRelativeTime(summary.notes?.lastActivityAt)}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    {formatCount(summary.notes?.total)} notes in total
                  </p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
                  <p className="text-xs uppercase tracking-widest text-sky-300">Contacts linked to organizations</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCount(
                      Math.max(
                        0,
                        (summary.contacts?.total ?? 0) - (summary.contacts?.withoutOrganization ?? 0),
                      ),
                    )}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    {formatCount(summary.contacts?.withoutOrganization)} contacts need mapping
                  </p>
                </div>
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </section>
  );
};

export default CrmDashboard;
