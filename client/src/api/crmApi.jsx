import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const createCrudClient = (path) => ({
  list: async (params) => {
    const response = await api.get(path, { params });
    return response.data;
  },
  create: async (payload) => {
    const response = await api.post(path, payload);
    return response.data;
  },
  update: async (id, payload) => {
    const response = await api.put(`${path}/${id}`, payload);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`${path}/${id}`);
    return response.data;
  },
});

export const crmDashboardApi = {
  getSummary: async () => {
    const response = await api.get('/crm/dashboard/summary');
    return response.data;
  },
};

export const leadsApi = createCrudClient('/crm/leads');
export const dealsApi = createCrudClient('/crm/deals');
export const contactsApi = createCrudClient('/crm/contacts');
export const organizationsApi = createCrudClient('/crm/organizations');
export const notesApi = createCrudClient('/crm/notes');

export default {
  dashboard: crmDashboardApi,
  leads: leadsApi,
  deals: dealsApi,
  contacts: contactsApi,
  organizations: organizationsApi,
  notes: notesApi,
};
