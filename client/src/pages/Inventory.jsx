// src/pages/Inventory.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Package,
  Layers,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  X,
  CheckCircle,
} from 'lucide-react';
import { inventoryApi } from '../api/supplierApi';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const defaultItemForm = {
  item_name: '',
  sku: '',
  quantity: '',
  unit_cost: '',
  reorder_level: '',
  location: '',
  description: '',
};

const defaultAdjustForm = {
  quantity: '',
  unit_cost: '',
  note: '',
};

const Modal = ({ title, onClose, children, footer }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-xl shadow-xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-gray-900"
        >
          <X className="w-5 h-5" />
          <span className="sr-only">Close modal</span>
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3">
          {footer}
        </div>
      )}
    </div>
  </div>
);

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const normaliseInventoryItem = (item) => {
  const quantityNumber = toNumberOrNull(item.quantity) ?? 0;
  const unitCostNumber = toNumberOrNull(item.unit_cost);
  const reorderLevelNumber = toNumberOrNull(item.reorder_level) ?? 0;
  const valueOnHand = quantityNumber * (unitCostNumber ?? 0);

  return {
    ...item,
    quantityNumber,
    unitCostNumber,
    reorderLevelNumber,
    valueOnHand,
  };
};

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [modalState, setModalState] = useState({ type: null, item: null });
  const [itemForm, setItemForm] = useState(defaultItemForm);
  const [adjustForm, setAdjustForm] = useState(defaultAdjustForm);
  const [formLoading, setFormLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState(null);

  const valueOnHand = useMemo(() => {
    return items.reduce((total, item) => total + (item.valueOnHand ?? 0), 0);
  }, [items]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryApi.getAll();
      const rows = Array.isArray(response?.data) ? response.data : [];
      const normalised = rows
        .map(normaliseInventoryItem)
        .sort((a, b) => {
          const nameA = (a.item_name || '').toString().toLowerCase();
          const nameB = (b.item_name || '').toString().toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
      setItems(normalised);
    } catch (err) {
      console.error('Error fetching inventory:', err);
      setError('Unable to load inventory right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalState({ type: null, item: null });
    setItemForm(defaultItemForm);
    setAdjustForm(defaultAdjustForm);
    setTransactions([]);
    setTransactionsLoading(false);
    setTransactionsError(null);
  };

  const openAddModal = () => {
    setModalState({ type: 'add', item: null });
    setItemForm(defaultItemForm);
  };

  const openAdjustModal = (type, item) => {
    setModalState({ type, item });
    setAdjustForm({
      quantity: '',
      unit_cost: type === 'buy' ? String(item.unit_cost ?? '') : '',
      note: '',
    });
  };

  const openHistoryModal = (item) => {
    setModalState({ type: 'history', item });
    setTransactionsError(null);
  };

  const loadTransactions = async (itemId) => {
    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      const response = await inventoryApi.getTransactions(itemId, 50);
      if (response?.success === false) {
        setTransactions([]);
        setTransactionsError(response?.error ?? 'Unable to load transaction history.');
        return;
      }
      setTransactions(response?.data ?? []);
      if ((response?.data ?? []).length === 0 && response?.message) {
        setTransactionsError(response.message);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
      setTransactions([]);
      const message =
        err?.response?.data?.error ||
        (err?.message?.includes('inventory_transactions')
          ? 'Transaction history is unavailable. Create an "inventory_transactions" table to enable logging.'
          : 'Unable to load transaction history.');
      setTransactionsError(message);
    } finally {
      setTransactionsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (modalState.type === 'history' && modalState.item) {
      loadTransactions(modalState.item.id);
    }
  }, [modalState]);

  const handleItemFormChange = (field, value) => {
    setItemForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdjustFormChange = (field, value) => {
    setAdjustForm((prev) => ({ ...prev, [field]: value }));
  };

  const toNumber = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!itemForm.item_name.trim()) {
      setAlert({ type: 'error', message: 'Item name is required.' });
      return;
    }

    const payload = {
      item_name: itemForm.item_name.trim(),
      sku: itemForm.sku.trim() || null,
      quantity: toNumber(itemForm.quantity) ?? 0,
      unit_cost: toNumber(itemForm.unit_cost),
      reorder_level: toNumber(itemForm.reorder_level) ?? 0,
      location: itemForm.location.trim() || null,
      description: itemForm.description.trim() || null,
    };

    try {
      setFormLoading(true);
      await inventoryApi.create(payload);
      setAlert({ type: 'success', message: 'Inventory item created successfully.' });
      closeModal();
      fetchInventory();
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to create inventory item.';
      setAlert({ type: 'error', message });
    } finally {
      setFormLoading(false);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    const quantity = toNumber(adjustForm.quantity);
    if (!quantity || quantity <= 0) {
      setAlert({ type: 'error', message: 'Quantity must be a positive number.' });
      return;
    }

    const payload = {
      quantity,
      note: adjustForm.note?.trim() || undefined,
    };

    if (modalState.type === 'buy') {
      const unitCost = toNumber(adjustForm.unit_cost);
      if (unitCost !== null) {
        payload.unit_cost = unitCost;
      }
    }

    try {
      setFormLoading(true);
      if (modalState.type === 'buy') {
        await inventoryApi.buy(modalState.item.id, payload);
        setAlert({ type: 'success', message: `Received ${quantity} units.` });
      } else {
        await inventoryApi.sell(modalState.item.id, payload);
        setAlert({ type: 'success', message: `Sold ${quantity} units.` });
      }
      closeModal();
      fetchInventory();
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to update stock.';
      setAlert({ type: 'error', message });
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Loading inventory...</div>
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
            onClick={fetchInventory}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Inventory</h2>
          <p className="text-gray-400 mt-1">Monitor stock levels, receive items, and capture sales.</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Items Tracked</p>
              <p className="text-lg font-semibold text-white">{items.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Value On Hand</p>
              <p className="text-lg font-semibold text-emerald-400">
                {currencyFormatter.format(valueOnHand)}
              </p>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {alert && (
        <div
          className={`rounded-lg border px-4 py-3 flex items-start gap-3 ${
            alert.type === 'success'
              ? 'bg-green-900/20 border-green-800'
              : 'bg-red-900/20 border-red-800'
          }`}
        >
          {alert.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
          )}
          <div className="flex-1 text-sm text-gray-200">{alert.message}</div>
          <button
            type="button"
            onClick={() => setAlert(null)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No inventory items yet</h3>
          <p className="text-gray-500 mb-6">Add your first item to begin tracking stock levels.</p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Inventory Item</span>
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Item</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">On Hand</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Unit Cost</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Reorder @</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Notes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Value</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {items.map((item) => {
                const quantity = item.quantityNumber ?? 0;
                const unitCost = item.unitCostNumber;
                const reorderLevel = item.reorderLevelNumber ?? 0;
                const value = item.valueOnHand ?? 0;
                const showReorderWarning = reorderLevel > 0 && quantity <= reorderLevel;
                const hasUnitCost = unitCost !== null && unitCost !== undefined;

                return (
                  <tr key={item.id} className="hover:bg-gray-800/60 transition-colors">
                    <td className="px-6 py-4 text-white font-medium flex items-center gap-3">
                      <span className="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300">
                        <Layers className="w-4 h-4" />
                      </span>
                      <span>{item.item_name ?? '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{item.sku || '-'}</td>
                    <td className="px-6 py-4 text-gray-400">
                      <span className="font-semibold text-white">{numberFormatter.format(quantity)}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {hasUnitCost ? currencyFormatter.format(unitCost) : '-'}
                    </td>
                    <td className={`px-6 py-4 ${showReorderWarning ? 'text-amber-400 font-semibold' : 'text-gray-400'}`}>
                      {reorderLevel ? numberFormatter.format(reorderLevel) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{item.location || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="line-clamp-2">{item.description || '—'}</span>
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">
                      {hasUnitCost ? currencyFormatter.format(value) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openAdjustModal('buy', item)}
                          className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          title="Receive stock"
                        >
                          <ArrowUpCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openAdjustModal('sell', item)}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                          title="Record sale"
                        >
                          <ArrowDownCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openHistoryModal(item)}
                          className="p-2 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700 transition-colors"
                          title="View history"
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalState.type === 'add' && (
        <Modal
          title="Add Inventory Item"
          onClose={formLoading ? () => {} : closeModal}
          footer={[
            <button
              key="cancel"
              type="button"
              onClick={closeModal}
              disabled={formLoading}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>,
            <button
              key="save"
              type="submit"
              form="inventory-create-form"
              disabled={formLoading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700 transition-colors disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : 'Save Item'}
            </button>,
          ]}
        >
          <form id="inventory-create-form" className="space-y-4" onSubmit={handleCreateItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemForm.item_name}
                  onChange={(e) => handleItemFormChange('item_name', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder={'e.g. 15" Laptop'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">SKU / Code</label>
                <input
                  type="text"
                  value={itemForm.sku}
                  onChange={(e) => handleItemFormChange('sku', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="SKU-001"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={itemForm.quantity}
                  onChange={(e) => handleItemFormChange('quantity', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Unit Cost (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={itemForm.unit_cost}
                  onChange={(e) => handleItemFormChange('unit_cost', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Reorder Level</label>
                <input
                  type="number"
                  min="0"
                  value={itemForm.reorder_level}
                  onChange={(e) => handleItemFormChange('reorder_level', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  value={itemForm.location}
                  onChange={(e) => handleItemFormChange('location', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Warehouse A"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Notes</label>
              <textarea
                rows="3"
                value={itemForm.description}
                onChange={(e) => handleItemFormChange('description', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Additional details, supplier info, etc."
              />
            </div>
          </form>
        </Modal>
      )}

      {(modalState.type === 'buy' || modalState.type === 'sell') && (
        <Modal
          title={`${modalState.type === 'buy' ? 'Receive' : 'Sell'} Stock - ${modalState.item.item_name}`}
          onClose={formLoading ? () => {} : closeModal}
          footer={[
            <button
              key="cancel"
              type="button"
              onClick={closeModal}
              disabled={formLoading}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>,
            <button
              key="save"
              type="submit"
              form="inventory-adjust-form"
              disabled={formLoading}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700 transition-colors disabled:opacity-50"
            >
              {formLoading ? 'Processing...' : modalState.type === 'buy' ? 'Receive Stock' : 'Record Sale'}
            </button>,
          ]}
        >
          <form id="inventory-adjust-form" className="space-y-4" onSubmit={handleAdjustStock}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Quantity <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min="1"
                  value={adjustForm.quantity}
                  onChange={(e) => handleAdjustFormChange('quantity', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0"
                  required
                />
              </div>
              {modalState.type === 'buy' && (
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Unit Cost (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={adjustForm.unit_cost}
                    onChange={(e) => handleAdjustFormChange('unit_cost', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Optional"
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Internal note</label>
              <textarea
                rows="3"
                value={adjustForm.note}
                onChange={(e) => handleAdjustFormChange('note', e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Reference purchase order, reason for adjustment, etc."
              />
            </div>
            <div className="text-xs text-gray-500">
              Current on-hand: <span className="font-semibold text-gray-200">{numberFormatter.format((modalState.item?.quantityNumber ?? toNumber(modalState.item?.quantity) ?? 0))}</span>
            </div>
          </form>
        </Modal>
      )}

      {modalState.type === 'history' && (
        <Modal
          title={`Transactions - ${modalState.item.item_name}`}
          onClose={closeModal}
          footer={[
            <button
              key="close"
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Close
            </button>,
          ]}
        >
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-4 text-sm text-gray-400">
              {transactionsError || 'No transactions recorded yet.'}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="border border-gray-800 rounded-lg px-4 py-3 bg-gray-800 flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {txn.type === 'BUY' ? 'Stock received' : 'Stock sold'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(txn.created_at).toLocaleString()} • Qty change:{' '}
                      <span
                        className={
                          txn.quantity_change >= 0 ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'
                        }
                      >
                        {txn.quantity_change >= 0 ? '+' : ''}
                        {numberFormatter.format(Math.abs(txn.quantity_change))}
                      </span>
                    </p>
                    {txn.note && <p className="text-xs text-gray-500 mt-1">Note: {txn.note}</p>}
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>Before: {numberFormatter.format(Number(txn.quantity_before) || 0)}</p>
                    <p>After: {numberFormatter.format(Number(txn.quantity_after) || 0)}</p>
                    {txn.unit_cost !== null && txn.unit_cost !== undefined && (
                      <p>Unit cost: {currencyFormatter.format(Number(txn.unit_cost) || 0)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {transactionsError && transactions.length > 0 && (
            <div className="pt-3 text-xs text-amber-300">{transactionsError}</div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default Inventory;
