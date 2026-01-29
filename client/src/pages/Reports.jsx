// src/pages/Reports.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BarChart3, LineChart, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  Line,
} from 'recharts';
import { inventoryApi } from '../api/supplierApi';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const chartColors = ['#34d399', '#60a5fa', '#f472b6', '#facc15', '#f97316', '#a855f7'];

const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const [analyticsResponse, transactionsResponse] = await Promise.all([
        inventoryApi.getAnalyticsSummary(),
        inventoryApi.getTransactions(undefined, 100),
      ]);

      setAnalytics(analyticsResponse?.data ?? null);
      setTransactions(transactionsResponse?.data ?? []);
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Unable to load analytics right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const dailyMovement = useMemo(() => {
    const map = new Map();
    transactions.forEach((txn) => {
      if (!txn.created_at) return;
      const dateKey = new Date(txn.created_at).toISOString().slice(0, 10);
      const current = map.get(dateKey) || 0;
      map.set(dateKey, current + (txn.quantity_change || 0));
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, netChange]) => ({
        date,
        netChange,
      }));
  }, [transactions]);

  const activitySummary = useMemo(() => {
    let incoming = 0;
    let outgoing = 0;
    transactions.forEach((txn) => {
      const change = Number(txn.quantity_change) || 0;
      if (change >= 0) incoming += change;
      else outgoing += Math.abs(change);
    });
    return { incoming, outgoing };
  }, [transactions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 flex items-start space-x-3">
        <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-red-500 font-semibold mb-1">Error</h3>
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadReports}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-400">
        No analytics available yet. Add inventory items and record activity to see insights here.
      </div>
    );
  }

  const {
    totalValue = 0,
    totalQuantity = 0,
    totalItems = 0,
    lowStockItems = [],
    inventoryByLocation = [],
    topValuedItems = [],
  } = analytics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Inventory Insights</h2>
          <p className="text-gray-400 mt-1">
            Visualize your stock value, location distribution, and movement trends.
          </p>
        </div>
        <button
          onClick={loadReports}
          className="inline-flex items-center gap-2 px-5 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-700 transition-all"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-500">Total stock value</p>
          <p className="text-2xl font-semibold text-emerald-400 mt-1">
            {currencyFormatter.format(totalValue)}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-500">Units on hand</p>
          <p className="text-2xl font-semibold text-white mt-1">
            {numberFormatter.format(totalQuantity)}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-500">Tracked items</p>
          <p className="text-2xl font-semibold text-white mt-1">{totalItems}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Top valued items</h3>
          </div>
          {topValuedItems.length === 0 ? (
            <p className="text-sm text-gray-500">Add inventory items to see this chart.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topValuedItems}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#9ca3af" tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    cursor={{ fill: 'rgba(55, 65, 81, 0.4)' }}
                    formatter={(value) => currencyFormatter.format(value)}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#34d399" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChartIcon className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Inventory by location</h3>
          </div>
          {inventoryByLocation.length === 0 ? (
            <p className="text-sm text-gray-500">Assign locations to items to see this chart.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={inventoryByLocation} dataKey="quantity" nameKey="location" outerRadius={100}>
                    {inventoryByLocation.map((entry, index) => (
                      <Cell key={entry.location} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => numberFormatter.format(value)} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Net movement (units)</h3>
          </div>
          {dailyMovement.length === 0 ? (
            <p className="text-sm text-gray-500">Operations will appear here once you buy or sell items.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyMovement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="date" stroke="#9ca3af" tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => numberFormatter.format(value)} />
                  <Tooltip formatter={(value) => numberFormatter.format(value)} />
                  <Line type="monotone" dataKey="netChange" stroke="#60a5fa" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Activity summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <p className="text-sm text-emerald-200">Units received</p>
              <p className="text-2xl font-semibold text-emerald-300 mt-1">
                {numberFormatter.format(activitySummary.incoming)}
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-200">Units sold</p>
              <p className="text-2xl font-semibold text-blue-300 mt-1">
                {numberFormatter.format(activitySummary.outgoing)}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Low stock alerts</h4>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-500">No items are below their reorder levels.</p>
            ) : (
              <ul className="space-y-2 text-sm text-gray-300">
                {lowStockItems.map((item) => (
                  <li key={item.id} className="flex items-center justify-between bg-gray-800/60 rounded-lg px-4 py-2">
                    <span>{item.item_name}</span>
                    <span className="text-amber-400 font-semibold">
                      {numberFormatter.format(item.quantity)} / {numberFormatter.format(item.reorder_level)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
