import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, RefreshCcw } from 'lucide-react';
import { contactsApi, organizationsApi } from '../../api/crmApi';

const defaultContact = {
  full_name: '',
  email: '',
  phone: '',
  role: '',
  organization_id: '',
  owner: '',
  notes: '',
};

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [formState, setFormState] = useState(defaultContact);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const loadOrganizations = async () => {
    try {
      const response = await organizationsApi.list();
      setOrganizations(response.data || []);
    } catch (err) {
      console.error('Failed to load organizations', err);
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await contactsApi.list();
      setContacts(response.data || []);
    } catch (err) {
      console.error('Failed to load contacts', err);
      setError(err.response?.data?.error || 'Unable to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
    loadOrganizations();
  }, []);

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const query = search.toLowerCase();
    return contacts.filter((contact) =>
      [contact.full_name, contact.email, contact.phone, contact.role, contact.owner, contact.organization_name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [contacts, search]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormState(defaultContact);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formState,
      organization_id: formState.organization_id || null,
    };

    try {
      if (editingId) {
        await contactsApi.update(editingId, payload);
      } else {
        await contactsApi.create(payload);
      }
      await loadContacts();
      resetForm();
    } catch (err) {
      console.error('Failed to save contact', err);
      setError(err.response?.data?.error || 'Unable to save contact');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setEditingId(contact.id);
    setFormState({
      full_name: contact.full_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role || '',
      organization_id: contact.organization_id ? String(contact.organization_id) : '',
      owner: contact.owner || '',
      notes: contact.notes || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    setLoading(true);
    setError(null);
    try {
      await contactsApi.remove(id);
      await loadContacts();
    } catch (err) {
      console.error('Failed to delete contact', err);
      setError(err.response?.data?.error || 'Unable to delete contact');
    } finally {
      setLoading(false);
    }
  };

  const orgName = (orgId) => {
    if (!orgId) return '—';
    const match = organizations.find((org) => String(org.id) === String(orgId));
    return match?.name || 'Organization';
  };

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contacts</h1>
          <p className="text-gray-400">
            Keep every stakeholder accountable with centralized contact intelligence and ownership context.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search contacts"
            className="w-48 rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
          />
          <button
            type="button"
            onClick={() => {
              loadContacts();
              loadOrganizations();
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
          <h2 className="text-xl font-semibold text-white">{editingId ? 'Update Contact' : 'Add Contact'}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-green-400 hover:text-green-300">
              Cancel edit
            </button>
          )}
        </div>

        {error && <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Full name *</span>
            <input
              required
              name="full_name"
              value={formState.full_name}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Email</span>
            <input
              name="email"
              type="email"
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
            <span>Role</span>
            <input
              name="role"
              value={formState.role}
              onChange={handleInputChange}
              placeholder="Decision maker, Influencer…"
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            />
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Organization</span>
            <select
              name="organization_id"
              value={formState.organization_id}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            >
              <option value="">Unassociated</option>
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
            {editingId ? 'Update contact' : 'Add contact'}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
        <table className="min-w-full divide-y divide-gray-800 text-sm">
          <thead className="bg-gray-900/80 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Organization</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-right">Added</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {loading && contacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  <p className="mt-2 text-sm">Loading contacts…</p>
                </td>
              </tr>
            ) : filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No contacts yet. Add your first stakeholder above.
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-900/60">
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-white">{contact.full_name}</div>
                    {contact.email && <div className="text-xs text-gray-400">{contact.email}</div>}
                    {contact.phone && <div className="text-xs text-gray-500">{contact.phone}</div>}
                  </td>
                  <td className="px-4 py-3 align-top text-sm">{contact.role || '—'}</td>
                  <td className="px-4 py-3 align-top text-sm">
                    {contact.organization_name || orgName(contact.organization_id)}
                  </td>
                  <td className="px-4 py-3 align-top text-sm">{contact.owner || 'Unassigned'}</td>
                  <td className="px-4 py-3 align-top text-right text-xs text-gray-500">
                    {contact.created_at ? new Date(contact.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(contact)}
                        className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-200 hover:bg-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(contact.id)}
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

export default Contacts;
