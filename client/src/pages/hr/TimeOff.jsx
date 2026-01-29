import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Umbrella, Plane, CheckCircle2, ArrowRight, Users } from 'lucide-react';

const REQUESTS = [
  {
    id: 'REQ-1042',
    employee: 'Amelia Chen',
    department: 'Revenue',
    range: 'Oct 15 – Oct 18',
    status: 'Pending approval',
    handoff: 'Reassign open CRM deals before departure.',
  },
  {
    id: 'REQ-1041',
    employee: 'Rafael Ortega',
    department: 'Operations',
    range: 'Oct 20 – Oct 25',
    status: 'Approved',
    handoff: 'Notify ERP inventory owners of coverage plan.',
  },
  {
    id: 'REQ-1039',
    employee: 'Priya Patel',
    department: 'People',
    range: 'Oct 30 – Nov 1',
    status: 'Pending approval',
    handoff: 'Coordinate with finance for payroll timing.',
  },
];

const TimeOff = () => {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return REQUESTS;
    return REQUESTS.filter((request) => request.status.toLowerCase().includes(statusFilter));
  }, [statusFilter]);

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Time-off management</h1>
          <p className="text-sm text-gray-400">
            Automatic handoffs keep CRM owners informed and ERP planners aligned when teammates are out.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <label className="flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/70 px-3 py-2">
            <CalendarClock className="h-4 w-4 text-gray-500" />
            <select
              className="bg-transparent text-sm text-gray-100 focus:outline-none"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all" className="bg-gray-900 text-gray-900">
                All requests
              </option>
              <option value="pending" className="bg-gray-900 text-gray-900">
                Pending
              </option>
              <option value="approved" className="bg-gray-900 text-gray-900">
                Approved
              </option>
            </select>
          </label>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
          <div className="flex items-center gap-3 text-gray-300">
            <Umbrella className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-semibold text-white">Upcoming time off</h2>
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">18 days</p>
          <p className="text-sm text-gray-400">Scheduled over the next 30 days across the company.</p>
        </article>
        <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
          <div className="flex items-center gap-3 text-gray-300">
            <Plane className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Escalations</h2>
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">2 owners</p>
          <p className="text-sm text-gray-400">Require CRM coverage assignments before travel begins.</p>
        </article>
        <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
          <div className="flex items-center gap-3 text-gray-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <h2 className="text-base font-semibold text-white">Payroll ready</h2>
          </div>
          <p className="mt-3 text-3xl font-semibold text-white">Yes</p>
          <p className="text-sm text-gray-400">Leaves automatically sync to ERP accounting for payouts.</p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80">
          <table className="min-w-full divide-y divide-gray-800 text-sm">
            <thead className="bg-gray-900/90 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3 text-left">Request</th>
                <th className="px-5 py-3 text-left">Dates</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Cross-suite handoff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {filtered.map((request) => (
                <tr key={request.id} className="transition hover:bg-gray-900/60">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white">{request.employee}</div>
                    <div className="text-xs text-gray-500">{request.department}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-300">{request.range}</td>
                  <td className="px-5 py-4 text-sm">
                    <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
                      {request.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-300">{request.handoff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900/70 p-6 text-sm text-gray-300">
          <div>
            <h2 className="text-base font-semibold text-white">Keep teams aligned</h2>
            <p className="mt-2 text-sm text-gray-400">
              Approvals here trigger CRM owner notifications and ERP calendar blocks automatically.
            </p>
          </div>
          <Link
            to="/crm"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-100 transition hover:border-blue-500/50 hover:bg-blue-500/15"
          >
            Check CRM handoffs
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/erp/accounting"
            className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:border-emerald-500/50 hover:bg-emerald-500/15"
          >
            Sync with ERP payroll
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="rounded-xl border border-gray-800 bg-gray-900/80 p-4 text-xs text-gray-400">
            <p className="font-medium text-gray-200">Need coverage?</p>
            <p className="mt-2">
              View available teammates and their workloads in the employee directory to coordinate smoother
              handoffs.
            </p>
            <Link to="/hr/employees" className="mt-3 inline-flex items-center gap-2 text-emerald-300 hover:text-emerald-200">
              Browse directory
              <Users className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default TimeOff;
