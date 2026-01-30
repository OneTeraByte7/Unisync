// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserCheck,
  Package,
  BadgeCheck,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';
import { dashboardApi } from '../api/supplierApi';

const numberFormatter = new Intl.NumberFormat('en-US');
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dashboardApi.getSummary();
        if (response?.success) {
          setSummary(response.data);
        } else if (response?.data) {
          setSummary(response.data);
        } else {
          throw new Error(response?.error || 'Unable to fetch dashboard data');
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Unable to load dashboard overview right now. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const inventoryByLocation = useMemo(() => summary?.inventory?.byLocation || [], [summary]);

  const cashflowSeries = useMemo(() => {
    if (!summary?.accounting) return [];
    const { totalReceivable = 0, totalPayable = 0, netCashflow = 0 } = summary.accounting;
    return [
      { label: 'Receivable', value: totalReceivable },
      { label: 'Payable', value: totalPayable },
      { label: 'Net', value: netCashflow },
    ];
  }, [summary]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800/40 rounded-xl p-6 h-32">
              <div className="h-4 bg-gray-700 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-700 rounded w-32"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800/40 rounded-xl p-6 h-64">
            <div className="h-6 bg-gray-700 rounded w-40 mb-4"></div>
            <div className="h-full bg-gray-700 rounded"></div>
          </div>
          <div className="bg-gray-800/40 rounded-xl p-6 h-64">
            <div className="h-6 bg-gray-700 rounded w-40 mb-4"></div>
            <div className="h-full bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
        <h3 className="text-red-400 font-semibold mb-2">Dashboard unavailable</h3>
        <p className="text-sm text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Welcome back</h2>
          <p className="text-gray-400 mt-1">Here&apos;s what&apos;s happening across your operation today.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
          <StatPill icon={Users} label="Suppliers" value={summary?.counts?.suppliers ?? 0} />
          <StatPill icon={UserCheck} label="Buyers" value={summary?.counts?.buyers ?? 0} />
          <StatPill icon={Package} label="Inventory Items" value={summary?.counts?.inventoryItems ?? 0} />
          <StatPill icon={BadgeCheck} label="Open Quality" value={summary?.counts?.openQualityItems ?? 0} tone="warning" />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="Inventory Value"
            description={`${numberFormatter.format(summary?.inventory?.totalQuantity ?? 0)} units on hand`}
            icon={Package}
            primary={currencyFormatter.format(summary?.inventory?.totalValue ?? 0)}
            secondary={`${summary?.inventory?.lowStockCount ?? 0} low stock alerts`}
          />
          <MetricCard
            title="Cash Position"
            description={`Receivable ${currencyFormatter.format(summary?.accounting?.totalReceivable ?? 0)} • Payable ${currencyFormatter.format(summary?.accounting?.totalPayable ?? 0)}`}
            icon={DollarSign}
            primary={currencyFormatter.format(summary?.accounting?.netCashflow ?? 0)}
            secondary={`${currencyFormatter.format(summary?.accounting?.overdueReceivable ?? 0)} overdue receivable`}
          />
          <MetricCard
            title="Quality Score"
            description={`${summary?.quality?.completed ?? 0} checks completed`}
            icon={TrendingUp}
            primary={`${summary?.quality?.averageScore ?? 0}%`}
            secondary={`${summary?.quality?.awaiting ?? 0} awaiting • ${summary?.quality?.inProgress ?? 0} in progress`}
          />
          <MetricCard
            title="Attention"
            description="Items that require follow-up"
            icon={AlertTriangle}
            primary={`${summary?.inventory?.lowStockCount ?? 0} inventory • ${summary?.accounting?.overduePayable ?? 0} overdue bills`}
            secondary={
              `${currencyFormatter.format(summary?.accounting?.overduePayable ?? 0)} overdue payables`
            }
          />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white">Cashflow snapshot</h3>
          <p className="text-sm text-gray-400 mb-4">
            Monitor receivables, payables, and net position.
          </p>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickFormatter={(value) => `${value >= 0 ? '' : '-'}${Math.abs(value) / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(148,163,184,0.2)',
                    borderRadius: '0.75rem',
                  }}
                  formatter={(value) => currencyFormatter.format(value)}
                />
                <Bar dataKey="value" radius={[8, 8, 8, 8]} fill="url(#cashflowGradient)" />
                <defs>
                  <linearGradient id="cashflowGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Inventory by location</h3>
            <span className="text-xs text-gray-500">Top warehouses by units</span>
          </div>
          {inventoryByLocation.length === 0 ? (
            <p className="text-sm text-gray-400">No location data yet. Add locations to inventory items to see distribution.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inventoryByLocation} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="inventoryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="location" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickFormatter={(value) => numberFormatter.format(value)} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(148,163,184,0.2)',
                      borderRadius: '0.75rem',
                    }}
                    formatter={(value) => numberFormatter.format(value)}
                  />
                  <Area type="monotone" dataKey="quantity" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#inventoryGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Quality status</h3>
            <span className="text-xs text-gray-500">Live overview</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <QualityChip label="Awaiting" value={summary?.quality?.awaiting ?? 0} tone="neutral" />
            <QualityChip label="In progress" value={summary?.quality?.inProgress ?? 0} tone="info" />
            <QualityChip label="Completed" value={summary?.quality?.completed ?? 0} tone="success" />
            <QualityChip label="Average score" value={`${summary?.quality?.averageScore ?? 0}%`} tone="accent" />
          </div>
          <p className="text-xs text-gray-500">
            Keep quality checks up to date to maintain a high quality score and reduce production risk.
          </p>
        </div>
      </div>
    </div>
  );
};

const StatPill = ({ icon, label, value, tone = 'default' }) => {
  const Icon = icon;
  const toneClasses = {
    default: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-full ${toneClasses[tone] || toneClasses.default}`}>
      <Icon className="w-4 h-4" />
      <div>
        <p className="text-xs uppercase tracking-wide opacity-80">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
};

const MetricCard = ({ title, description, icon, primary, secondary }) => {
  const Icon = icon;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-emerald-300">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <p className="text-2xl font-semibold text-white">{primary}</p>
      <p className="text-xs text-gray-500">{secondary}</p>
    </div>
  );
};

const QualityChip = ({ label, value, tone }) => {
  const toneClasses = {
    neutral: 'bg-slate-800/80 border border-slate-700 text-slate-200',
    info: 'bg-blue-500/10 border border-blue-500/30 text-blue-300',
    success: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300',
    accent: 'bg-purple-500/10 border border-purple-500/30 text-purple-300',
  };

  return (
    <div className={`rounded-2xl px-4 py-3 ${toneClasses[tone] || toneClasses.neutral}`}>
      <p className="text-xs uppercase tracking-wide opacity-70">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
};

export default Dashboard;
