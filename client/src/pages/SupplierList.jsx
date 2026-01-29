// src/pages/SupplierList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Users, AlertCircle } from 'lucide-react';
import { supplierApi } from '../api/supplierApi';

const SupplierList = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayOrDash = (value) => {
    if (value === null || value === undefined) return '-';
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : '-';
  };

  const formatLocation = (supplier) => {
    const parts = [supplier.city, supplier.state, supplier.country]
      .map(displayOrDash)
      .filter((part) => part !== '-');
    return parts.length ? parts.join(', ') : '-';
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierApi.getAll();
      setSuppliers(response.data || []);
    } catch (err) {
      setError('Failed to load suppliers. Please try again.');
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, supplierName) => {
    if (window.confirm(`Are you sure you want to delete "${supplierName}"?`)) {
      try {
        await supplierApi.delete(id);
        // Reload suppliers after deletion
        loadSuppliers();
      } catch (err) {
        alert('Failed to delete supplier. Please try again.');
        console.error('Error deleting supplier:', err);
      }
    }
  };

  const handleEdit = (supplier) => {
    navigate('/add-supplier', { state: { supplier } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-lg">Loading suppliers...</div>
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
            onClick={loadSuppliers}
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Suppliers</h2>
          <p className="text-gray-400 mt-1">Manage your supplier network</p>
        </div>
        <button
          onClick={() => navigate('/add-supplier')}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Supplier</span>
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No Suppliers Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by adding your first supplier
          </p>
          <button
            onClick={() => navigate('/add-supplier')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add First Supplier</span>
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Supplier
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Address
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                  Location
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">
                    {displayOrDash(supplier.supplier_name)}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {displayOrDash(supplier.contact_name)}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{displayOrDash(supplier.email)}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {displayOrDash(supplier.phone)}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {displayOrDash(supplier.address)}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {formatLocation(supplier)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit supplier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier.id, displayOrDash(supplier.supplier_name))}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete supplier"
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
    </div>
  );
};

export default SupplierList;