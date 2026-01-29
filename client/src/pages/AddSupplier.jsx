// src/pages/AddSupplier.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SupplierForm from '../components/SupplierForm';
import { supplierApi } from '../api/supplierApi';
import { CheckCircle, AlertCircle } from 'lucide-react';

const AddSupplier = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const supplier = location.state?.supplier;

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      setMessage(null);

      if (supplier) {
        // Update existing supplier
        await supplierApi.update(supplier.id, formData);
        setMessage({ type: 'success', text: 'Supplier updated successfully!' });
      } else {
        // Create new supplier
        await supplierApi.create(formData);
        setMessage({ type: 'success', text: 'Supplier created successfully!' });
      }

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/suppliers');
      }, 1500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to save supplier. Please try again.',
      });
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/suppliers');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">
          {supplier ? 'Edit Supplier' : 'Add New Supplier'}
        </h2>
        <p className="text-gray-400 mt-1">
          {supplier ? 'Update supplier information' : 'Enter supplier details below'}
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg p-4 flex items-start space-x-3 ${
            message.type === 'success'
              ? 'bg-green-900/20 border border-green-800'
              : 'bg-red-900/20 border border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <p
            className={`${
              message.type === 'success' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message.text}
          </p>
        </div>
      )}

      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <SupplierForm
          supplier={supplier}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AddSupplier;