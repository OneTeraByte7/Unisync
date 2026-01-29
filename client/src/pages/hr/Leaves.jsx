import React, { useCallback, useEffect, useState } from 'react';
import { hrApi } from '../../api/hrApi';
import { CalendarClock, CheckCircle, Hourglass, XCircle, Loader2, Plus, Pencil, Trash2, X } from 'lucide-react';

const defaultLeaveForm = {
  employeeName: '',
  leaveType: 'PTO',
  startDate: '',
  endDate: '',
  status: 'Pending',
  notes: '',
};

const Leaves = () => {
  const [data, setData] = useState({ balances: [], requests: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [leaveFormVisible, setLeaveFormVisible] = useState(false);
  const [leaveForm, setLeaveForm] = useState(defaultLeaveForm);
  const [editingLeaveId, setEditingLeaveId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const response = await hrApi.getLeaves();
      setData(response?.data ?? { balances: [], requests: [], stats: {} });
      setError(null);
    } catch (err) {
      console.error('Failed to load leave data', err);
      setError('Leave balances are temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const { approved = 0, pending = 0, declined = 0 } = data.stats || {};

  const openLeaveForm = (request) => {
    if (request) {
      setLeaveForm({
        employeeName: request.employee_name ?? '',
        leaveType: request.leave_type ?? 'PTO',
        startDate: request.start_date ?? '',
        endDate: request.end_date ?? '',
        status: request.status ?? 'Pending',
        notes: request.notes ?? '',
      });
      setEditingLeaveId(request.id);
    } else {
      setLeaveForm(defaultLeaveForm);
      setEditingLeaveId(null);
    }
    setFormError('');
    setLeaveFormVisible(true);
  };

  const closeLeaveForm = () => {
    setLeaveFormVisible(false);
    setLeaveForm(defaultLeaveForm);
    setEditingLeaveId(null);
    setFormError('');
  };

  const handleLeaveChange = (field, value) => {
    setLeaveForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLeaveSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        employeeName: leaveForm.employeeName,
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        status: leaveForm.status,
        notes: leaveForm.notes,
      };

      if (editingLeaveId) {
        await hrApi.updateLeaveRequest(editingLeaveId, payload);
      } else {
        await hrApi.createLeaveRequest(payload);
      }

      await loadLeaves();
      closeLeaveForm();
    } catch (err) {
      setFormError(err.response?.data?.error ?? 'Unable to save leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLeave = async (id) => {
    if (!id) return;
    const confirmation = window.confirm('Delete this leave request? This cannot be undone.');
    if (!confirmation) return;

    try {
      await hrApi.deleteLeaveRequest(id);
      await loadLeaves();
    } catch (err) {
      console.error('Failed to delete leave request', err);
      alert('Could not delete the leave request. Please try again.');
    }
  };

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Leaves & absence</h1>
            <p className="max-w-3xl text-sm text-gray-400">
              Bring policy compliance, coverage planning, and employee well-being into a single, shareable dashboard. Every
              absence syncs into shift scheduling and payroll downstream.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openLeaveForm()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            Request leave
          </button>
        </div>
      </header>

      {leaveFormVisible && (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-sm text-emerald-100">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-200">
              <CalendarClock className="h-4 w-4" />
              <h2 className="text-base font-semibold text-white">
                {editingLeaveId ? 'Update leave request' : 'Log new leave request'}
              </h2>
            </div>
            <button
              type="button"
              onClick={closeLeaveForm}
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 p-2 text-emerald-100 transition hover:bg-emerald-500/25"
              aria-label="Close leave form"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleLeaveSubmit}>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">Employee</span>
              <input
                value={leaveForm.employeeName}
                onChange={(event) => handleLeaveChange('employeeName', event.target.value)}
                required
                placeholder="Taylor Morgan"
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">Leave type</span>
              <input
                value={leaveForm.leaveType}
                onChange={(event) => handleLeaveChange('leaveType', event.target.value)}
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">Start date</span>
              <input
                type="date"
                value={leaveForm.startDate}
                onChange={(event) => handleLeaveChange('startDate', event.target.value)}
                required
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">End date</span>
              <input
                type="date"
                value={leaveForm.endDate}
                onChange={(event) => handleLeaveChange('endDate', event.target.value)}
                required
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">Status</span>
              <select
                value={leaveForm.status}
                onChange={(event) => handleLeaveChange('status', event.target.value)}
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              >
                <option value="Pending" className="bg-gray-900 text-gray-900">
                  Pending
                </option>
                <option value="Approved" className="bg-gray-900 text-gray-900">
                  Approved
                </option>
                <option value="Declined" className="bg-gray-900 text-gray-900">
                  Declined
                </option>
              </select>
            </label>
            <label className="md:col-span-2 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-[0.28em] text-emerald-200/80">Reason</span>
              <textarea
                value={leaveForm.notes}
                onChange={(event) => handleLeaveChange('notes', event.target.value)}
                rows={3}
                className="rounded-lg border border-emerald-500/40 bg-gray-950/60 px-3 py-2 text-sm text-white focus:border-emerald-400 focus:outline-none"
              />
            </label>
            {formError && (
              <p className="md:col-span-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{formError}</p>
            )}
            <div className="md:col-span-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeLeaveForm}
                className="rounded-lg border border-emerald-500/30 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-500/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-emerald-900 shadow-md transition hover:bg-white"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingLeaveId ? 'Update request' : 'Create request'}
              </button>
            </div>
          </form>
        </section>
      )}

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/70 px-6 py-5 text-sm text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          Gathering leave activity…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-sm text-red-100">{error}</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <h2 className="text-sm font-semibold text-gray-200">Approved</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{approved}</p>
              <p className="mt-2 text-xs text-gray-500">Requests approved in the rolling quarter.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <Hourglass className="h-5 w-5 text-blue-400" />
                <h2 className="text-sm font-semibold text-gray-200">Pending</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{pending}</p>
              <p className="mt-2 text-xs text-gray-500">Awaiting manager or HR approval.</p>
            </article>
            <article className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-rose-400" />
                <h2 className="text-sm font-semibold text-gray-200">Declined</h2>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{declined}</p>
              <p className="mt-2 text-xs text-gray-500">Include escalations or policy exceptions.</p>
            </article>
          </div>

          <section className="grid gap-6 lg:grid-cols-[1.6fr_1.4fr]">
            <div className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-white">Balance view</h2>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {(data.balances || []).length} tracked
                </span>
              </div>
              <div className="mt-5 overflow-hidden rounded-xl border border-gray-800">
                <table className="min-w-full divide-y divide-gray-800 text-sm text-gray-200">
                  <thead className="bg-gray-900/80 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Employee</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Available days</th>
                      <th className="px-4 py-3 text-left">Next leave</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900">
                    {(data.balances || []).map((balance) => (
                      <tr key={balance.id} className="transition hover:bg-gray-900/60">
                        <td className="px-4 py-3 font-medium text-white">{balance.employee_name}</td>
                        <td className="px-4 py-3 text-gray-300">{balance.type}</td>
                        <td className="px-4 py-3 text-gray-200">{balance.available_days}</td>
                        <td className="px-4 py-3 text-gray-500">{balance.upcoming_leave || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
              <h2 className="text-lg font-semibold text-white">Approval queue</h2>
              <div className="mt-4 space-y-4">
                {(data.requests || []).map((request) => (
                  <article key={request.id} className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
                    <div className="flex items-start justify-between text-sm">
                      <div>
                        <span className="font-semibold text-white">{request.employee_name}</span>
                        <p className="mt-1 text-xs text-gray-500">{request.leave_type}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openLeaveForm(request)}
                          className="rounded-lg border border-gray-700/70 bg-gray-900/60 p-2 text-xs text-gray-200 transition hover:border-emerald-500/40 hover:text-white"
                          aria-label="Edit leave"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLeave(request.id)}
                          className="rounded-lg border border-red-500/40 bg-red-500/10 p-2 text-xs text-red-200 transition hover:bg-red-500/20"
                          aria-label="Delete leave"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      {request.start_date} → {request.end_date}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">Status • {request.status}</p>
                    {request.notes && <p className="mt-2 text-xs text-gray-400">Notes • {request.notes}</p>}
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

export default Leaves;
