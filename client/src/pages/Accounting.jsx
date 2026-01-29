// src/pages/Accounting.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Landmark,
} from 'lucide-react';
import { accountingApi } from '../api/supplierApi';

const defaultAccountingForm = {
  entry_type: 'RECEIVABLE',
  entity_name: '',
  reference: '',
  amount: '',
  currency: 'USD',
  status: 'pending',
  due_date: '',
  paid_at: '',
  notes: '',
};

const Accounting = () => {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [modalState, setModalState] = useState({ type: null, entry: null });
  const [accountingForm, setAccountingForm] = useState(defaultAccountingForm);
  const [formLoading, setFormLoading] = useState(false);
  const [filter, setFilter] = useState('RECEIVABLE');

  const fetchAccounting = async () => {
    try {
      setLoading(true);
      setError(null);

      const [listResponse, summaryResponse] = await Promise.all([
        accountingApi.getAll(),
        accountingApi.getSummary(),
      ]);

      setEntries(listResponse?.data ?? []);
      setSummary(summaryResponse?.data ?? null);
    } catch (err) {
      console.error('Failed to load accounting entries:', err);
      setError(err?.response?.data?.error || 'Unable to load accounting data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounting();
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => (entry.entry_type || '').toUpperCase() === filter);
  }, [entries, filter]);

  const closeModal = () => {
    setModalState({ type: null, entry: null });
    setAccountingForm(defaultAccountingForm);
    setFormLoading(false);
  };

  const openCreateModal = (type) => {
    setModalState({ type: 'create', entry: null });
    setAccountingForm({ ...defaultAccountingForm, entry_type: type || 'RECEIVABLE' });
  };

  const openEditModal = (entry) => {
    setModalState({ type: 'edit', entry });
    setAccountingForm({
      entry_type: entry.entry_type || 'RECEIVABLE',
      entity_name: entry.entity_name || '',
      reference: entry.reference || '',
      amount: entry.amount ?? '',
      currency: entry.currency || 'USD',
      status: entry.status || 'pending',
      due_date: entry.due_date ? entry.due_date.slice(0, 10) : '',
      paid_at: entry.paid_at ? entry.paid_at.slice(0, 10) : '',
      notes: entry.notes || '',
    });
  };

  const handleFormChange = (field, value) => {
    setAccountingForm((prev) => ({ ...prev, [field]: value }));
  };

  const toNullable = (value) => {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  const toNumber = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!accountingForm.entity_name.trim()) {
      setAlert({ type: 'error', message: 'Company or customer name is required.' });
      return;
    }

    const payload = {
      entry_type: (accountingForm.entry_type || 'RECEIVABLE').toUpperCase(),
      entity_name: accountingForm.entity_name.trim(),
      reference: toNullable(accountingForm.reference),
      amount: toNumber(accountingForm.amount) ?? 0,
      currency: toNullable(accountingForm.currency) || 'USD',
      status: toNullable(accountingForm.status) || 'pending',
      due_date: toNullable(accountingForm.due_date),
      paid_at: toNullable(accountingForm.paid_at),
      notes: toNullable(accountingForm.notes),
    };

    try {
      setFormLoading(true);
      if (modalState.type === 'create') {
        await accountingApi.create(payload);
        setAlert({ type: 'success', message: 'Accounting entry created.' });
      } else if (modalState.type === 'edit' && modalState.entry) {
        await accountingApi.update(modalState.entry.id, payload);
        setAlert({ type: 'success', message: 'Accounting entry updated.' });
      }
      closeModal();
      fetchAccounting();
    } catch (err) {
      console.error('Error saving accounting entry:', err);
      const message = err?.response?.data?.error || 'Unable to save accounting entry.';
      setAlert({ type: 'error', message });
      setFormLoading(false);
    }
  };

  const handleDelete = async (entry) => {
    const confirmed = window.confirm(`Delete ${entry.entry_type.toLowerCase()} entry for ${entry.entity_name}?`);
    if (!confirmed) return;

    try {
      await accountingApi.delete(entry.id);
      setAlert({ type: 'success', message: 'Accounting entry removed.' });
      fetchAccounting();
    } catch (err) {
      console.error('Error deleting accounting entry:', err);
      const message = err?.response?.data?.error || 'Unable to delete entry.';
      setAlert({ type: 'error', message });
    }
  };

  const markPaid = async (entry) => {
    try {
      await accountingApi.update(entry.id, {
        status: 'paid',
        paid_at: new Date().toISOString(),
      });
      setAlert({ type: 'success', message: `${entry.entry_type === 'RECEIVABLE' ? 'Invoice' : 'Bill'} marked as paid.` });
      fetchAccounting();
    } catch (err) {
      console.error('Error marking entry as paid:', err);
      setAlert({ type: 'error', message: 'Unable to update payment status.' });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Accounting desk</h2>
          <p className="text-gray-400 mt-1">Track receivables, payables, and cash position in one place.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openCreateModal('RECEIVABLE')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" /> Receivable
          </button>
          <button
            type="button"
            onClick={() => openCreateModal('PAYABLE')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" /> Payable
          </button>
        </div>
      </header>

      {summary && (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AccountingSummaryCard
            icon={ArrowDownCircle}
            title="Receivable"
            value={`$${(summary.totalReceivable || 0).toLocaleString()}`}
            caption="Total open invoices"
            tone="emerald"
          />
          <AccountingSummaryCard
            icon={ArrowUpCircle}
            title="Payable"
            value={`$${(summary.totalPayable || 0).toLocaleString()}`}
            caption="Bills awaiting payment"
            tone="blue"
          />
          <AccountingSummaryCard
            icon={CalendarClock}
            title="Overdue"
            value={`$${((summary.overdueReceivable || 0) + (summary.overduePayable || 0)).toLocaleString()}`}
            caption={`${summary.overdueReceivable || 0} receivable • ${summary.overduePayable || 0} payable`}
            tone="amber"
          />
          <AccountingSummaryCard
            icon={Banknote}
            title="Net position"
            value={`$${(summary.netCashflow || 0).toLocaleString()}`}
            caption="Receivable minus payable"
            tone={summary.netCashflow >= 0 ? 'emerald' : 'red'}
          />
        </section>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-2 w-fit">
  {['RECEIVABLE', 'PAYABLE'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === type ? 'bg-emerald-500/20 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {type === 'RECEIVABLE' ? 'Receivables' : 'Payables'}
          </button>
        ))}
      </div>

      {alert && (
        <div
          className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${
            alert.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
              : 'bg-red-500/10 border-red-500/30 text-red-100'
          }`}
        >
          <span className="text-sm flex-1">{alert.message}</span>
          <button type="button" onClick={() => setAlert(null)} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-red-200">
          <h3 className="font-semibold mb-1">Unable to load accounting data</h3>
          <p className="text-sm mb-3">{error}</p>
          <button type="button" onClick={fetchAccounting} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white">
            Retry
          </button>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <Landmark className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-white mb-2">No entries in this bucket</h3>
          <p className="text-gray-500 mb-3">Create a new record to start tracking cash flow.</p>
          <button
            type="button"
            onClick={() => openCreateModal(filter)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" /> New {filter === 'RECEIVABLE' ? 'receivable' : 'payable'}
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-6 py-3 text-left">Entity</th>
                <th className="px-6 py-3 text-left">Reference</th>
                <th className="px-6 py-3 text-left">Amount</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Due</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-white">{entry.entity_name}</p>
                    <p className="text-xs text-gray-500">{entry.notes || '—'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{entry.reference || '—'}</td>
                  <td className="px-6 py-4 text-sm text-emerald-300">
                    {entry.currency || 'USD'} {Number(entry.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusChip status={entry.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {entry.due_date ? new Date(entry.due_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => markPaid(entry)}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        title="Mark as paid"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(entry)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                        title="Edit entry"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(entry)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modalState.type === 'create' || modalState.type === 'edit') && (
        <Modal
          title={modalState.type === 'create' ? 'New accounting entry' : `Update ${modalState.entry?.entity_name}`}
          onClose={formLoading ? () => {} : closeModal}
          footer={[
            <button
              key="cancel"
              type="button"
              onClick={closeModal}
              disabled={formLoading}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>,
            <button
              key="save"
              type="submit"
              form="accounting-form"
              disabled={formLoading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : 'Save entry'}
            </button>,
          ]}
        >
          <form id="accounting-form" className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Type</label>
                <select
                  value={accountingForm.entry_type}
                  onChange={(e) => handleFormChange('entry_type', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="RECEIVABLE">Receivable</option>
                  <option value="PAYABLE">Payable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Entity name</label>
                <input
                  type="text"
                  value={accountingForm.entity_name}
                  onChange={(e) => handleFormChange('entity_name', e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Customer or vendor"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Reference</label>
                <input
                  type="text"
                  value={accountingForm.reference}
                  onChange={(e) => handleFormChange('reference', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Invoice #, PO #, etc."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={accountingForm.amount}
                  onChange={(e) => handleFormChange('amount', e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Currency</label>
                <input
                  type="text"
                  value={accountingForm.currency}
                  onChange={(e) => handleFormChange('currency', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="USD"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Status</label>
                <select
                  value={accountingForm.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Due date</label>
                <input
                  type="date"
                  value={accountingForm.due_date}
                  onChange={(e) => handleFormChange('due_date', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Paid on</label>
                <input
                  type="date"
                  value={accountingForm.paid_at}
                  onChange={(e) => handleFormChange('paid_at', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Notes</label>
              <textarea
                rows="3"
                value={accountingForm.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Payment terms, reference documents, follow-up actions"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

const AccountingSummaryCard = ({ icon, title, value, caption, tone }) => {
  const Icon = icon;
  const toneClasses = {
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-100',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-100',
    red: 'bg-red-500/10 border-red-500/30 text-red-100',
  };

  return (
    <div className={`border rounded-xl p-5 flex items-center gap-4 ${toneClasses[tone] || toneClasses.emerald}`}>
      <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide opacity-80">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {caption && <p className="text-xs opacity-70 mt-1">{caption}</p>}
      </div>
    </div>
  );
};

const StatusChip = ({ status }) => {
  const key = (status || 'pending').toLowerCase();
  const entries = {
    pending: { label: 'Pending', className: 'bg-slate-800 text-slate-200 border border-slate-700' },
    sent: { label: 'Sent', className: 'bg-blue-500/10 text-blue-200 border border-blue-500/30' },
    paid: { label: 'Paid', className: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30' },
    overdue: { label: 'Overdue', className: 'bg-red-500/10 text-red-200 border border-red-500/30' },
  };
  const style = entries[key] || entries.pending;

  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.className}`}>{style.label}</span>;
};

const Modal = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl shadow-xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-gray-900"
        >
          Close
        </button>
      </div>
      <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3">{footer}</div>}
    </div>
  </div>
);

export default Accounting;
