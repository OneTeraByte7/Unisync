import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, RefreshCcw } from 'lucide-react';
import { notesApi, leadsApi, dealsApi, contactsApi, organizationsApi } from '../../api/crmApi';

const defaultNote = {
  subject: '',
  note: '',
  owner: '',
  related_type: 'lead',
  related_id: '',
};

const relatedTypes = [
  { value: 'lead', label: 'Lead' },
  { value: 'deal', label: 'Deal' },
  { value: 'contact', label: 'Contact' },
  { value: 'organization', label: 'Organization' },
];

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [formState, setFormState] = useState(defaultNote);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [relatedData, setRelatedData] = useState({ leads: [], deals: [], contacts: [], organizations: [] });

  const loadRelatedData = async () => {
    try {
      const [leadResponse, dealResponse, contactResponse, organizationResponse] = await Promise.all([
        leadsApi.list(),
        dealsApi.list(),
        contactsApi.list(),
        organizationsApi.list(),
      ]);
      setRelatedData({
        leads: leadResponse.data || [],
        deals: dealResponse.data || [],
        contacts: contactResponse.data || [],
        organizations: organizationResponse.data || [],
      });
    } catch (err) {
      console.error('Failed to load related CRM data for notes', err);
    }
  };

  const loadNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notesApi.list();
      setNotes(response.data || []);
    } catch (err) {
      console.error('Failed to load notes', err);
      setError(err.response?.data?.error || 'Unable to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
    loadRelatedData();
  }, []);

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes;
    const query = search.toLowerCase();
    return notes.filter((note) =>
      [note.subject, note.note, note.owner, note.related_type, note.related_name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [notes, search]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormState(defaultNote);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formState,
      related_id: formState.related_id || null,
    };

    try {
      if (editingId) {
        await notesApi.update(editingId, payload);
      } else {
        await notesApi.create(payload);
      }
      await loadNotes();
      resetForm();
    } catch (err) {
      console.error('Failed to save note', err);
      setError(err.response?.data?.error || 'Unable to save note');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setFormState({
      subject: note.subject || '',
      note: note.note || '',
      owner: note.owner || '',
      related_type: note.related_type || 'lead',
      related_id: note.related_id ? String(note.related_id) : '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    setLoading(true);
    setError(null);
    try {
      await notesApi.remove(id);
      await loadNotes();
    } catch (err) {
      console.error('Failed to delete note', err);
      setError(err.response?.data?.error || 'Unable to delete note');
    } finally {
      setLoading(false);
    }
  };

  const relatedOptions = (type) => {
    switch (type) {
      case 'lead':
        return relatedData.leads.map((lead) => ({ value: lead.id, label: `${lead.name}${lead.company ? ` • ${lead.company}` : ''}` }));
      case 'deal':
        return relatedData.deals.map((deal) => ({ value: deal.id, label: `${deal.title}${deal.stage ? ` • ${deal.stage}` : ''}` }));
      case 'contact':
        return relatedData.contacts.map((contact) => ({ value: contact.id, label: `${contact.full_name}${contact.email ? ` • ${contact.email}` : ''}` }));
      case 'organization':
        return relatedData.organizations.map((org) => ({ value: org.id, label: org.name }));
      default:
        return [];
    }
  };

  const lookupRelatedName = (note) => {
    const options = relatedOptions(note.related_type);
    const match = options.find((option) => String(option.value) === String(note.related_id));
    return match?.label || '—';
  };

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notes</h1>
          <p className="text-gray-400">
            Log interactions, call notes, and next steps so sales, success, and marketing stay aligned.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notes"
            className="w-48 rounded-lg border border-gray-800 bg-gray-900/80 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
          />
          <button
            type="button"
            onClick={() => {
              loadNotes();
              loadRelatedData();
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
          <h2 className="text-xl font-semibold text-white">{editingId ? 'Update Note' : 'Log Note'}</h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-green-400 hover:text-green-300">
              Cancel edit
            </button>
          )}
        </div>

        {error && <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm text-red-300">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Subject *</span>
            <input
              required
              name="subject"
              value={formState.subject}
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
            <span>Related to</span>
            <select
              name="related_type"
              value={formState.related_type}
              onChange={(event) => {
                const value = event.target.value;
                setFormState((prev) => ({ ...prev, related_type: value, related_id: '' }));
              }}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            >
              {relatedTypes.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm text-gray-300">
            <span>Record</span>
            <select
              name="related_id"
              value={formState.related_id}
              onChange={handleInputChange}
              className="rounded-lg border border-gray-800 bg-gray-950/60 px-3 py-2 text-gray-100 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/60"
            >
              <option value="">Unlinked</option>
              {relatedOptions(formState.related_type).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-1 text-sm text-gray-300">
          <span>Notes</span>
          <textarea
            name="note"
            value={formState.note}
            onChange={handleInputChange}
            rows={4}
            placeholder="Capture call notes, meeting takeaways, or follow-up actions."
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
            {editingId ? 'Update note' : 'Add note'}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
        <table className="min-w-full divide-y divide-gray-800 text-sm">
          <thead className="bg-gray-900/80 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Related</th>
              <th className="px-4 py-3 text-left">Summary</th>
              <th className="px-4 py-3 text-right">Logged</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-gray-200">
            {loading && notes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  <p className="mt-2 text-sm">Loading notes…</p>
                </td>
              </tr>
            ) : filteredNotes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No notes yet. Capture meeting intel and call logs above.
                </td>
              </tr>
            ) : (
              filteredNotes.map((note) => (
                <tr key={note.id} className="hover:bg-gray-900/60">
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-white">{note.subject}</div>
                    <span className="text-xs uppercase text-gray-500">{note.related_type}</span>
                  </td>
                  <td className="px-4 py-3 align-top text-sm">{note.owner || 'Unassigned'}</td>
                  <td className="px-4 py-3 align-top text-sm">{note.related_name || lookupRelatedName(note)}</td>
                  <td className="px-4 py-3 align-top text-sm text-gray-300">
                    {note.note ? `${note.note.slice(0, 120)}${note.note.length > 120 ? '…' : ''}` : '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-right text-xs text-gray-500">
                    {note.created_at ? new Date(note.created_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 align-top text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(note)}
                        className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-200 hover:bg-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
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

export default Notes;
