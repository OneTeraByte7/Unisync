import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, RefreshCcw } from 'lucide-react';
import { dealsApi, leadsApi, organizationsApi } from '../../api/crmApi';

const defaultDeal = {
  title: '',
  stage: 'Prospecting',
  value: '',
  probability: 20,
  close_date: '',
  lead_id: '',
  organization_id: '',
  owner: '',
  notes: '',
};

const stageOptions = [
  'Prospecting',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Contract',
  'Closed Won',
  'Closed Lost',
];

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [formState, setFormState] = useState(defaultDeal);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadRelated = async () => {
    try {
      const [leadsResponse, orgResponse] = await Promise.all([leadsApi.list(), organizationsApi.list()]);
      setLeads(leadsResponse.data || []);
      setOrganizations(orgResponse.data || []);
    } catch (err) {
      console.error('Failed to load related CRM datasets', err);
    }
  };

  const loadDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dealsApi.list();
      setDeals(response.data || []);
    } catch (err) {
      console.error('Failed to load deals', err);
      setError(err.response?.data?.error || 'Unable to load deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
    loadRelated();
  }, []);

  const filteredDeals = useMemo(() => {
    if (!search.trim()) return deals;
    const query = search.toLowerCase();
    return deals.filter((deal) =>
      [deal.title, deal.stage, deal.owner, deal.notes]
        .concat(deal.organization_name, deal.lead_name)
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [deals, search]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormState(defaultDeal);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formState,
      value: formState.value ? Number(formState.value) : null,
      probability: formState.probability ? Number(formState.probability) : null,
      lead_id: formState.lead_id || null,
      organization_id: formState.organization_id || null,
    };

    try {
      if (editingId) {
        await dealsApi.update(editingId, payload);
      } else {
        await dealsApi.create(payload);
      }
      await loadDeals();
      resetForm();
    } catch (err) {
      console.error('Failed to save deal', err);
      setError(err.response?.data?.error || 'Unable to save deal');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (deal) => {
    setEditingId(deal.id);
    setFormState({
      title: deal.title || '',
      stage: deal.stage || 'Prospecting',
      value: deal.value ?? '',
      probability: deal.probability ?? 20,
      close_date: deal.close_date ? deal.close_date.substring(0, 10) : '',
      lead_id: deal.lead_id ? String(deal.lead_id) : '',
      organization_id: deal.organization_id ? String(deal.organization_id) : '',
      owner: deal.owner || '',
      notes: deal.notes || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this deal?')) return;
    setLoading(true);
    setError(null);
    try {
      await dealsApi.remove(id);
      await loadDeals();
    } catch (err) {
      console.error('Failed to delete deal', err);
      setError(err.response?.data?.error || 'Unable to delete deal');
    } finally {
      setLoading(false);
    }
  };

  const findLeadName = (leadId) => {
    if (!leadId) return '—';
    const match = leads.find((lead) => String(lead.id) === String(leadId));
    return match?.name || 'Lead';
  };

  const findOrgName = (orgId) => {
    if (!orgId) return '—';
    const match = organizations.find((org) => String(org.id) === String(orgId));
    return match?.name || 'Organization';
  };

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Deals</h1>
          <p className="text-gray-400">
            Monitor sales opportunities, forecast revenue, and understand which stages need attention.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search deals"
            className="w-48 rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
          />
          <button
            type="button"
            onClick={() => {
              loadDeals();
              loadRelated();
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-gray-800 bg-gray-900/70 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{editingId ? 'Update Deal' : 'Log Deal'}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-green-400 hover:text-green-300">
              Cancel edit
            </button>
          )}
        </div>

        {error && <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Title *</span>
            <input
              required
              name="title"
              value={formState.title}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Stage</span>
            <select
              name="stage"
              value={formState.stage}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            >
              {stageOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Deal value ($)</span>
            <input
              type="number"
              name="value"
              min="0"
              step="0.01"
              value={formState.value}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Probability (%)</span>
            <input
              type="number"
              name="probability"
              min="0"
              max="100"
              step="5"
              value={formState.probability}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Expected close date</span>
            <input
              type="date"
              name="close_date"
              value={formState.close_date}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Lead</span>
            <select
              name="lead_id"
              value={formState.lead_id}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            >
              <option value="">Unlinked</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} {lead.company ? `• ${lead.company}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Organization</span>
            <select
              name="organization_id"
              value={formState.organization_id}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            >
              <option value="">Unassigned</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
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
            {editingId ? 'Update deal' : 'Add deal'}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
        <table className="min-w-full divide-y divide-gray-800 text-sm">
          <thead className="bg-gray-900/80 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Deal</th>
              <th className="px-4 py-3 text-left">Stage</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Lead</th>
              <th className="px-4 py-3 text-left">Organization</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3 text-right">Close</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {loading && deals.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  <p className="mt-2 text-sm">Loading deals…</p>
                </td>
              </tr>
            ) : filteredDeals.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  No deals yet. Log your first opportunity above.
                </td>
              </tr>
            ) : (
              filteredDeals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-900/60">
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-white">{deal.title}</div>
                    <div className="text-xs text-gray-400">Probability {deal.probability ?? 0}%</div>
                  </td>
                  <td className="px-4 py-3 align-top text-sm text-emerald-300">{deal.stage}</td>
                  <td className="px-4 py-3 align-top text-sm">{deal.owner || 'Unassigned'}</td>
                  <td className="px-4 py-3 align-top text-sm">{deal.lead_name || findLeadName(deal.lead_id)}</td>
                  <td className="px-4 py-3 align-top text-sm">
                    {deal.organization_name || findOrgName(deal.organization_id)}
                  </td>
                  <td className="px-4 py-3 align-top text-right font-medium text-green-300">
                    {deal.value ? `$${Number(deal.value).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-right text-xs text-gray-500">
                    {deal.close_date ? new Date(deal.close_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(deal)}
                        className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-200 hover:bg-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(deal.id)}
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

export default Deals;
