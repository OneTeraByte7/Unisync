import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, RefreshCcw } from 'lucide-react';
import { leadsApi } from '../../api/crmApi';

const defaultLead = {
  name: '',
  company: '',
  email: '',
  phone: '',
  status: 'New',
  source: 'Website',
  owner: '',
  value: '',
  notes: '',
};

const statusOptions = ['New', 'Qualified', 'Contacted', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const sourceOptions = ['Website', 'Referral', 'Event', 'Outbound', 'Partner', 'Other'];

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState(defaultLead);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const filteredLeads = useMemo(() => {
    if (!search.trim()) return leads;
    const query = search.toLowerCase();
    return leads.filter((lead) =>
      [lead.name, lead.company, lead.email, lead.phone, lead.status, lead.source, lead.owner]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [leads, search]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await leadsApi.list();
      const rows = Array.isArray(response?.data) ? response.data : [];
      const normalised = rows
        .map((lead) => {
          const hasValue = lead?.value !== null && lead?.value !== undefined;
          const numericValue = hasValue ? Number(lead.value) : null;
          return {
            ...lead,
            value: hasValue ? (Number.isFinite(numericValue) ? numericValue : 0) : null,
            created_at: lead?.created_at ?? null,
          };
        })
        .sort((a, b) => {
          const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
          const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
          return bDate - aDate;
        });
      setLeads(normalised);
    } catch (err) {
      console.error('Failed to load leads', err);
      setError(err.response?.data?.error || 'Unable to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormState(defaultLead);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formState,
      value: formState.value ? Number(formState.value) : null,
    };

    try {
      if (editingId) {
        await leadsApi.update(editingId, payload);
      } else {
        await leadsApi.create(payload);
      }
      await loadLeads();
      resetForm();
    } catch (err) {
      console.error('Failed to save lead', err);
      setError(err.response?.data?.error || 'Unable to save lead');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lead) => {
    setEditingId(lead.id);
    setFormState({
      name: lead.name || '',
      company: lead.company || '',
      email: lead.email || '',
      phone: lead.phone || '',
      status: lead.status || 'New',
      source: lead.source || 'Website',
      owner: lead.owner || '',
      value: lead.value ?? '',
      notes: lead.notes || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead? This cannot be undone.')) return;
    setLoading(true);
    try {
      await leadsApi.remove(id);
      await loadLeads();
    } catch (err) {
      console.error('Failed to delete lead', err);
      setError(err.response?.data?.error || 'Unable to delete lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-gray-400">
            Capture prospects, track qualification progress, and route opportunities to the right owner.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search leads"
              className="w-48 rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </div>
          <button
            type="button"
            onClick={loadLeads}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{editingId ? 'Update Lead' : 'Create Lead'}</h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-green-400 hover:text-green-300"
            >
              Cancel edit
            </button>
          )}
        </div>

        {error && <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Name *</span>
            <input
              required
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Company</span>
            <input
              name="company"
              value={formState.company}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Status</span>
            <select
              name="status"
              value={formState.status}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Source</span>
            <select
              name="source"
              value={formState.source}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            >
              {sourceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={formState.email}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Phone</span>
            <input
              name="phone"
              value={formState.phone}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Owner</span>
            <input
              name="owner"
              value={formState.owner}
              onChange={handleInputChange}
              placeholder="Team member"
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Potential value ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              name="value"
              value={formState.value}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </label>
        </div>

        <label className="grid gap-1 text-sm text-gray-300">
          <span>Notes</span>
          <textarea
            name="notes"
            value={formState.notes}
            onChange={handleInputChange}
            rows={3}
            className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
          />
        </label>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {editingId ? 'Update lead' : 'Add lead'}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
        <table className="min-w-full divide-y divide-gray-800 text-sm">
          <thead className="bg-gray-900/80 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Lead</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3 text-right">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {loading && leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  <p className="mt-2 text-sm">Loading leads…</p>
                </td>
              </tr>
            ) : filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  No leads found. Create your first prospect above.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-900/60">
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-white">{lead.name}</div>
                    <div className="text-xs text-gray-400">{lead.company || '—'}</div>
                    {lead.email && <div className="text-xs text-gray-500">{lead.email}</div>}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-300">
                      {lead.status || 'New'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-sm">{lead.owner || 'Unassigned'}</td>
                  <td className="px-4 py-3 align-top text-sm">{lead.source || '—'}</td>
                  <td className="px-4 py-3 align-top text-right font-medium text-green-300">
                    {lead.value ? `$${Number(lead.value).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-right text-xs text-gray-500">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(lead)}
                        className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-200 hover:bg-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(lead.id)}
                        className="rounded-lg border border-red-700/70 px-3 py-1 text-xs text-red-300 hover:bg-red-900/40"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Leads;
