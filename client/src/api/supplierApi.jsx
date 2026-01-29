// src/api/supplierApi.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const supplierApi = {
  // Get all suppliers
  getAll: async () => {
    try {
      const response = await api.get('/suppliers');
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  },

  // Get single supplier by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier:', error);
      throw error;
    }
  },

  // Create new supplier
  create: async (supplierData) => {
    try {
      const response = await api.post('/suppliers', supplierData);
      return response.data;
    } catch (error) {
      console.error('Error creating supplier:', error);
      throw error;
    }
  },

  // Update supplier
  update: async (id, supplierData) => {
    try {
      const response = await api.put(`/suppliers/${id}`, supplierData);
      return response.data;
    } catch (error) {
      console.error('Error updating supplier:', error);
      throw error;
    }
  },

  // Delete supplier
  delete: async (id) => {
    try {
      const response = await api.delete(`/suppliers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting supplier:', error);
      throw error;
    }
  },
};

export const inventoryApi = {
  // Get all inventory items
  getAll: async () => {
    try {
      const response = await api.get('/inventory');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  },

  // Get single inventory item by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  },

  // Create new inventory item
  create: async (inventoryData) => {
    try {
      const response = await api.post('/inventory', inventoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  },

  // Update inventory item
  update: async (id, inventoryData) => {
    try {
      const response = await api.put(`/inventory/${id}`, inventoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  },

  // Delete inventory item
  delete: async (id) => {
    try {
      const response = await api.delete(`/inventory/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },

  // Buy inventory (increase quantity)
  buy: async (id, payload) => {
    try {
      const response = await api.post(`/inventory/${id}/buy`, payload);
      return response.data;
    } catch (error) {
      console.error('Error buying inventory item:', error);
      throw error;
    }
  },

  // Sell inventory (decrease quantity)
  sell: async (id, payload) => {
    try {
      const response = await api.post(`/inventory/${id}/sell`, payload);
      return response.data;
    } catch (error) {
      console.error('Error selling inventory item:', error);
      throw error;
    }
  },

  // Fetch transactions
  getTransactions: async (id, limit = 25) => {
    try {
      const url = id ? `/inventory/${id}/transactions` : '/inventory/transactions';
      const response = await api.get(url, { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory transactions:', error);
      throw error;
    }
  },

  // Fetch analytics summary
  getAnalyticsSummary: async () => {
    try {
      const response = await api.get('/inventory/analytics/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory analytics:', error);
      throw error;
    }
  },
};

export const buyerApi = {
  getAll: async () => {
    try {
      const response = await api.get('/buyers');
      return response.data;
    } catch (error) {
      console.error('Error fetching buyers:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await api.get(`/buyers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching buyer:', error);
      throw error;
    }
  },
  create: async (payload) => {
    try {
      const response = await api.post('/buyers', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating buyer:', error);
      throw error;
    }
  },
  update: async (id, payload) => {
    try {
      const response = await api.put(`/buyers/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating buyer:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/buyers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting buyer:', error);
      throw error;
    }
  },
};

export const qualityApi = {
  getAll: async () => {
    try {
      const response = await api.get('/quality');
      return response.data;
    } catch (error) {
      console.error('Error fetching quality checks:', error);
      throw error;
    }
  },
  getSummary: async () => {
    try {
      const response = await api.get('/quality/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching quality summary:', error);
      throw error;
    }
  },
  create: async (payload) => {
    try {
      const response = await api.post('/quality', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating quality check:', error);
      throw error;
    }
  },
  update: async (id, payload) => {
    try {
      const response = await api.put(`/quality/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating quality check:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/quality/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting quality check:', error);
      throw error;
    }
  },
};

export const accountingApi = {
  getAll: async (type) => {
    try {
      const response = await api.get('/accounting', { params: type ? { type } : undefined });
      return response.data;
    } catch (error) {
      console.error('Error fetching accounting entries:', error);
      throw error;
    }
  },
  getSummary: async () => {
    try {
      const response = await api.get('/accounting/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching accounting summary:', error);
      throw error;
    }
  },
  create: async (payload) => {
    try {
      const response = await api.post('/accounting', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating accounting entry:', error);
      throw error;
    }
  },
  update: async (id, payload) => {
    try {
      const response = await api.put(`/accounting/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating accounting entry:', error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const response = await api.delete(`/accounting/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting accounting entry:', error);
      throw error;
    }
  },
};

export const dashboardApi = {
  getSummary: async () => {
    try {
      const response = await api.get('/dashboard/summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  },
};

export default supplierApi;