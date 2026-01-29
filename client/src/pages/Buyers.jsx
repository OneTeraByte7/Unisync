// src/pages/Buyers.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { buyerApi } from '../api/supplierApi';
import {
  Plus,
  UserCheck,
  Building2,
  Mail,
  Phone,
  Pencil,
  Trash2,
  Loader2,
  CreditCard,
  Search,
} from 'lucide-react';

const defaultBuyerForm = {
  buyer_name: '',
  company_name: '',
  contact_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: '',
  credit_limit: '',
  payment_terms: '',
  notes: '',
};

const Buyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [modalState, setModalState] = useState({ type: null, buyer: null });
  const [buyerForm, setBuyerForm] = useState(defaultBuyerForm);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await buyerApi.getAll();
      const data = response?.data ?? [];
      setBuyers(data);
    } catch (err) {
      console.error('Error loading buyers:', err);
      const message = err?.response?.data?.error || 'Unable to load buyers right now. Please try again later.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  const totalCreditLimit = useMemo(() => {
    return buyers.reduce((sum, buyer) => {
      const credit = Number(buyer.credit_limit) || 0;
      return sum + credit;
    }, 0);
  }, [buyers]);

  const filteredBuyers = useMemo(() => {
    if (!searchTerm.trim()) return buyers;
    const query = searchTerm.toLowerCase();
    return buyers.filter((buyer) => {
      const tokens = [
        buyer.buyer_name,
        buyer.company_name,
        buyer.contact_name,
        buyer.email,
        buyer.phone,
        buyer.city,
        buyer.state,
        buyer.country,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return tokens.includes(query);
    });
  }, [buyers, searchTerm]);

  const closeModal = () => {
    setModalState({ type: null, buyer: null });
    setBuyerForm(defaultBuyerForm);
    setFormLoading(false);
  };

  const openCreateModal = () => {
    setModalState({ type: 'create', buyer: null });
    setBuyerForm(defaultBuyerForm);
  };

  const openEditModal = (buyer) => {
    setModalState({ type: 'edit', buyer });
    setBuyerForm({
      buyer_name: buyer.buyer_name ?? '',
      company_name: buyer.company_name ?? '',
      contact_name: buyer.contact_name ?? '',
      email: buyer.email ?? '',
      phone: buyer.phone ?? '',
      address: buyer.address ?? '',
      city: buyer.city ?? '',
      state: buyer.state ?? '',
      country: buyer.country ?? '',
      credit_limit: buyer.credit_limit ?? '',
      payment_terms: buyer.payment_terms ?? '',
      notes: buyer.notes ?? '',
    });
  };

  const handleFormChange = (field, value) => {
    setBuyerForm((prev) => ({ ...prev, [field]: value }));
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

    if (!buyerForm.buyer_name.trim()) {
      setAlert({ type: 'error', message: 'Buyer name is required.' });
      return;
    }

    const payload = {
      buyer_name: buyerForm.buyer_name.trim(),
      company_name: toNullable(buyerForm.company_name),
      contact_name: toNullable(buyerForm.contact_name),
      email: toNullable(buyerForm.email),
      phone: toNullable(buyerForm.phone),
      address: toNullable(buyerForm.address),
      city: toNullable(buyerForm.city),
      state: toNullable(buyerForm.state),
      country: toNullable(buyerForm.country),
      credit_limit: toNumber(buyerForm.credit_limit),
      payment_terms: toNullable(buyerForm.payment_terms),
      notes: toNullable(buyerForm.notes),
    };

    try {
      setFormLoading(true);
      if (modalState.type === 'create') {
        await buyerApi.create(payload);
        setAlert({ type: 'success', message: 'Buyer added successfully.' });
      } else if (modalState.type === 'edit' && modalState.buyer) {
        await buyerApi.update(modalState.buyer.id, payload);
        setAlert({ type: 'success', message: 'Buyer updated successfully.' });
      }
      closeModal();
      fetchBuyers();
    } catch (err) {
      console.error('Error saving buyer:', err);
      const message = err?.response?.data?.error || 'Unable to save buyer. Please try again.';
      setAlert({ type: 'error', message });
      setFormLoading(false);
    }
  };

  const handleDelete = async (buyer) => {
    const confirmed = window.confirm(`Remove ${buyer.buyer_name}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await buyerApi.delete(buyer.id);
      setAlert({ type: 'success', message: 'Buyer removed successfully.' });
      fetchBuyers();
    } catch (err) {
      console.error('Error deleting buyer:', err);
      const message = err?.response?.data?.error || 'Unable to delete buyer right now.';
      setAlert({ type: 'error', message });
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Buyers</h2>
          <p className="text-gray-400 mt-1">Manage customers, credit limits, and primary contacts.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search buyers"
              className="pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add buyer</span>
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          icon={UserCheck}
          title="Active buyers"
          value={buyers.length}
          description="Customers ready to order"
        />
        <SummaryCard
          icon={CreditCard}
          title="Credit exposure"
          value={`$${(totalCreditLimit || 0).toLocaleString()}`}
          description="Total credit limits on file"
        />
        <SummaryCard
          icon={Building2}
          title="Regions"
          value={new Set(buyers.map((buyer) => buyer.country || 'Unassigned')).size}
          description="Countries represented"
        />
      </section>

      {alert && (
        <div
          className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${
            alert.type === 'success'
              ? 'bg-green-900/20 border-green-800 text-green-200'
              : 'bg-red-900/20 border-red-800 text-red-200'
          }`}
        >
          <div className="flex-1 text-sm">{alert.message}</div>
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
          <h3 className="font-semibold mb-1">Unable to load buyers</h3>
          <p className="text-sm mb-3">{error}</p>
          <button
            type="button"
            onClick={fetchBuyers}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            Retry
          </button>
        </div>
      ) : filteredBuyers.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <UserCheck className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-white mb-2">No buyers found</h3>
          <p className="text-gray-500 mb-4">Add your first buyer or adjust your search filters.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New buyer</span>
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800 text-xs uppercase tracking-wide text-gray-400">
              <tr>
                <th className="px-6 py-3 text-left">Buyer</th>
                <th className="px-6 py-3 text-left">Contact</th>
                <th className="px-6 py-3 text-left">Credit limit</th>
                <th className="px-6 py-3 text-left">Payment terms</th>
                <th className="px-6 py-3 text-left">Location</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredBuyers.map((buyer) => (
                <tr key={buyer.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-white">{buyer.buyer_name || '—'}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5" /> {buyer.company_name || 'Independent'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <div className="flex flex-col gap-1">
                      {buyer.contact_name && <span>{buyer.contact_name}</span>}
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {buyer.email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" /> {buyer.email}
                          </span>
                        )}
                        {buyer.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" /> {buyer.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-300">
                    {buyer.credit_limit ? `$${Number(buyer.credit_limit).toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{buyer.payment_terms || 'Net 30'}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {[buyer.city, buyer.state, buyer.country].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(buyer)}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        title="Edit buyer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(buyer)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        title="Delete buyer"
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
          title={modalState.type === 'create' ? 'Add buyer' : `Update ${modalState.buyer?.buyer_name}`}
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
              form="buyer-form"
              disabled={formLoading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700 disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : 'Save buyer'}
            </button>,
          ]}
        >
          <form id="buyer-form" className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">
                  Buyer name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={buyerForm.buyer_name}
                  onChange={(e) => handleFormChange('buyer_name', e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Acme Retail Co"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  value={buyerForm.company_name}
                  onChange={(e) => handleFormChange('company_name', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Buyer company"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Primary contact</label>
                <input
                  type="text"
                  value={buyerForm.contact_name}
                  onChange={(e) => handleFormChange('contact_name', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={buyerForm.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="buyer@email.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={buyerForm.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Credit limit (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={buyerForm.credit_limit}
                  onChange={(e) => handleFormChange('credit_limit', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Payment terms</label>
                <input
                  type="text"
                  value={buyerForm.payment_terms}
                  onChange={(e) => handleFormChange('payment_terms', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Net 30"
                />
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">City</label>
                  <input
                    type="text"
                    value={buyerForm.city}
                    onChange={(e) => handleFormChange('city', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Los Angeles"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">State / Province</label>
                  <input
                    type="text"
                    value={buyerForm.state}
                    onChange={(e) => handleFormChange('state', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="CA"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Country</label>
                  <input
                    type="text"
                    value={buyerForm.country}
                    onChange={(e) => handleFormChange('country', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="United States"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Notes</label>
              <textarea
                rows="3"
                value={buyerForm.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Additional account notes, preferences, or agreements"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

const SummaryCard = ({ icon, title, value, description }) => {
  const Icon = icon;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-white">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
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

export default Buyers;
