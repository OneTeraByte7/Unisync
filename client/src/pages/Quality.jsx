// src/pages/Quality.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  ClipboardCheck,
  ShieldCheck,
  TimerReset,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';
import { qualityApi } from '../api/supplierApi';

const defaultQualityForm = {
  title: '',
  owner: '',
  location: '',
  due_date: '',
  status: 'scheduled',
  score: '',
  score_max: '',
  notes: '',
};

const Quality = () => {
  const [checks, setChecks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [modalState, setModalState] = useState({ type: null, check: null });
  const [qualityForm, setQualityForm] = useState(defaultQualityForm);
  const [formLoading, setFormLoading] = useState(false);

  const fetchQuality = async () => {
    try {
      setLoading(true);
      setError(null);

      const [listResponse, summaryResponse] = await Promise.all([
        qualityApi.getAll(),
        qualityApi.getSummary(),
      ]);

      setChecks(listResponse?.data ?? []);
      setSummary(summaryResponse?.data ?? null);
    } catch (err) {
      console.error('Failed to load quality checks:', err);
      setError(err?.response?.data?.error || 'Unable to load quality checks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuality();
  }, []);

  const completionRate = useMemo(() => {
    if (!summary) return 0;
    if (summary.total === 0) return 0;
    return Math.round(((summary.completed || 0) / summary.total) * 100);
  }, [summary]);

  const closeModal = () => {
    setModalState({ type: null, check: null });
    setQualityForm(defaultQualityForm);
    setFormLoading(false);
  };

  const openCreateModal = () => {
    setModalState({ type: 'create', check: null });
    setQualityForm(defaultQualityForm);
  };

  const openEditModal = (check) => {
    setModalState({ type: 'edit', check });
    setQualityForm({
      title: check.title || '',
      owner: check.owner || '',
      location: check.location || '',
      due_date: check.due_date ? check.due_date.slice(0, 10) : '',
      status: check.status || 'scheduled',
      score: check.score ?? '',
      score_max: check.score_max ?? '',
      notes: check.notes || '',
    });
  };

  const handleFormChange = (field, value) => {
    setQualityForm((prev) => ({ ...prev, [field]: value }));
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

    if (!qualityForm.title.trim()) {
      setAlert({ type: 'error', message: 'Quality check title is required.' });
      return;
    }

    const payload = {
      title: qualityForm.title.trim(),
      owner: toNullable(qualityForm.owner),
      location: toNullable(qualityForm.location),
      due_date: toNullable(qualityForm.due_date),
      status: toNullable(qualityForm.status) || 'scheduled',
      score: toNumber(qualityForm.score),
      score_max: toNumber(qualityForm.score_max),
      notes: toNullable(qualityForm.notes),
    };

    try {
      setFormLoading(true);
      if (modalState.type === 'create') {
        await qualityApi.create(payload);
        setAlert({ type: 'success', message: 'Quality check created.' });
      } else if (modalState.type === 'edit' && modalState.check) {
        await qualityApi.update(modalState.check.id, payload);
        setAlert({ type: 'success', message: 'Quality check updated.' });
      }
      closeModal();
      fetchQuality();
    } catch (err) {
      console.error('Error saving quality check:', err);
      const message = err?.response?.data?.error || 'Unable to save quality check.';
      setAlert({ type: 'error', message });
      setFormLoading(false);
    }
  };

  const handleDelete = async (check) => {
    const confirmed = window.confirm(`Delete quality check "${check.title}"?`);
    if (!confirmed) return;

    try {
      await qualityApi.delete(check.id);
      setAlert({ type: 'success', message: 'Quality check removed.' });
      fetchQuality();
    } catch (err) {
      console.error('Error deleting quality check:', err);
      const message = err?.response?.data?.error || 'Unable to delete quality check.';
      setAlert({ type: 'error', message });
    }
  };

  const markCompleted = async (check) => {
    try {
      await qualityApi.update(check.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
      setAlert({ type: 'success', message: 'Quality check marked as completed.' });
      fetchQuality();
    } catch (err) {
      console.error('Error completing quality check:', err);
      setAlert({ type: 'error', message: 'Unable to update quality check status.' });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Quality control</h2>
          <p className="text-gray-400 mt-1">Track inspections, audits, and remediation tasks in real time.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>New quality check</span>
        </button>
      </header>

      {summary && (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QualitySummaryCard
            icon={ClipboardCheck}
            label="Scheduled"
            value={summary.awaiting ?? 0}
            tone="neutral"
          />
          <QualitySummaryCard icon={TimerReset} label="In progress" value={summary.inProgress ?? 0} tone="info" />
          <QualitySummaryCard icon={ShieldCheck} label="Completed" value={summary.completed ?? 0} tone="success" />
          <QualitySummaryCard
            icon={AlertTriangle}
            label="Completion rate"
            value={`${completionRate}%`}
            tone={completionRate >= 80 ? 'success' : completionRate >= 50 ? 'info' : 'warning'}
            caption={`${summary.total ?? 0} total checks`}
          />
        </section>
      )}

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
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-red-200">
          <h3 className="font-semibold mb-1">Unable to load quality checks</h3>
          <p className="text-sm mb-3">{error}</p>
          <button type="button" onClick={fetchQuality} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white">
            Retry
          </button>
        </div>
      ) : checks.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <ShieldCheck className="w-14 h-14 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No quality checks scheduled</h3>
          <p className="text-gray-500 mb-4">
            Create your first inspection to start tracking quality performance.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" /> New quality check
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-6 py-3 text-left">Title</th>
                <th className="px-6 py-3 text-left">Owner</th>
                <th className="px-6 py-3 text-left">Due date</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Score</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {checks.map((check) => (
                <tr key={check.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-white">{check.title}</p>
                    <p className="text-xs text-gray-500">{check.location || 'Location not set'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{check.owner || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {check.due_date ? new Date(check.due_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={check.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {check.score !== null && check.score !== undefined && check.score_max
                      ? `${check.score} / ${check.score_max}`
                      : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => markCompleted(check)}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        title="Mark as completed"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditModal(check)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
                        title="Edit check"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(check)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        title="Delete check"
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
          title={modalState.type === 'create' ? 'New quality check' : `Update ${modalState.check?.title}`}
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
              form="quality-form"
              disabled={formLoading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : 'Save changes'}
            </button>,
          ]}
        >
          <form id="quality-form" className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={qualityForm.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Incoming goods inspection"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Owner</label>
                <input
                  type="text"
                  value={qualityForm.owner}
                  onChange={(e) => handleFormChange('owner', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Quality lead"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={qualityForm.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Warehouse A"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Due date</label>
                <input
                  type="date"
                  value={qualityForm.due_date}
                  onChange={(e) => handleFormChange('due_date', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Status</label>
                <select
                  value={qualityForm.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Score</label>
                  <input
                    type="number"
                    min="0"
                    value={qualityForm.score}
                    onChange={(e) => handleFormChange('score', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="8"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Max score</label>
                  <input
                    type="number"
                    min="0"
                    value={qualityForm.score_max}
                    onChange={(e) => handleFormChange('score_max', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Notes</label>
              <textarea
                rows="3"
                value={qualityForm.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Inspection notes, issues found, or follow-up actions"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

const QualitySummaryCard = ({ icon, label, value, tone, caption }) => {
  const Icon = icon;
  const toneClasses = {
    neutral: 'bg-slate-800 border-slate-700 text-slate-200',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
  };

  return (
    <div className={`border rounded-xl p-5 flex items-center gap-4 ${toneClasses[tone] || toneClasses.neutral}`}>
      <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm uppercase tracking-wide opacity-70">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
        {caption && <p className="text-xs opacity-70 mt-1">{caption}</p>}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const tone = (status || 'scheduled').toLowerCase();
  const config = {
    scheduled: { label: 'Scheduled', className: 'bg-slate-800 text-slate-200 border border-slate-700' },
    in_progress: { label: 'In progress', className: 'bg-blue-500/10 text-blue-200 border border-blue-500/30' },
    'in-progress': { label: 'In progress', className: 'bg-blue-500/10 text-blue-200 border border-blue-500/30' },
    completed: { label: 'Completed', className: 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/30' },
  };

  const style = config[tone] || config.scheduled;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${style.className}`}>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
      </span>
      {style.label}
    </span>
  );
};

const Modal = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-3xl shadow-xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900"
        >
          Close
        </button>
      </div>
      <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
      {footer && <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3">{footer}</div>}
    </div>
  </div>
);

export default Quality;
