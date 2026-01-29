import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const safeGet = async (path, params) => {
  try {
    const response = await api.get(path, { params });
    return response.data;
  } catch (error) {
    console.error(`HR API request failed for ${path}:`, error);
    throw error;
  }
};

const safeMutation = async (method, path, payload) => {
  try {
    let response;
    switch (method) {
      case 'post':
        response = await api.post(path, payload);
        break;
      case 'put':
        response = await api.put(path, payload);
        break;
      case 'delete':
        response = await api.delete(path, { data: payload });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    return response.data;
  } catch (error) {
    console.error(`HR API ${method.toUpperCase()} failed for ${path}:`, error);
    throw error;
  }
};

export const hrApi = {
  getDashboardSummary: () => safeGet('/hr/dashboard/summary'),
  getRecruitment: (params) => safeGet('/hr/recruitment', params),
  getEmployeeLifecycle: () => safeGet('/hr/employee-lifecycle'),
  getPerformance: () => safeGet('/hr/performance'),
  getShiftAttendance: (params) => safeGet('/hr/shift-attendance', params),
  getExpenseClaims: (params) => safeGet('/hr/expense-claims', params),
  getLeaves: () => safeGet('/hr/leaves'),
  getProjects: () => safeGet('/hr/projects'),
  getUsers: () => safeGet('/hr/users'),
  getWebsite: () => safeGet('/hr/website'),
  getPayrollSummary: () => safeGet('/hr/payroll/summary'),
  getPayrollRuns: () => safeGet('/hr/payroll/runs'),
  getPayrollBenefits: () => safeGet('/hr/payroll/benefits'),
  createRecruitmentJob: (payload) => safeMutation('post', '/hr/recruitment/jobs', payload),
  updateRecruitmentJob: (id, payload) => safeMutation('put', `/hr/recruitment/jobs/${id}`, payload),
  deleteRecruitmentJob: (id) => safeMutation('delete', `/hr/recruitment/jobs/${id}`),
  createRecruitmentApplication: (payload) => safeMutation('post', '/hr/recruitment/applications', payload),
  updateRecruitmentApplication: (id, payload) => safeMutation('put', `/hr/recruitment/applications/${id}`, payload),
  deleteRecruitmentApplication: (id) => safeMutation('delete', `/hr/recruitment/applications/${id}`),
  createLeaveRequest: (payload) => safeMutation('post', '/hr/leave-requests', payload),
  updateLeaveRequest: (id, payload) => safeMutation('put', `/hr/leave-requests/${id}`, payload),
  deleteLeaveRequest: (id) => safeMutation('delete', `/hr/leave-requests/${id}`),
  createExpenseClaim: (payload) => safeMutation('post', '/hr/expense-claims', payload),
  updateExpenseClaim: (id, payload) => safeMutation('put', `/hr/expense-claims/${id}`, payload),
  deleteExpenseClaim: (id) => safeMutation('delete', `/hr/expense-claims/${id}`),
  createProject: (payload) => safeMutation('post', '/hr/projects', payload),
  updateProject: (id, payload) => safeMutation('put', `/hr/projects/${id}`, payload),
  deleteProject: (id) => safeMutation('delete', `/hr/projects/${id}`),
};

export default hrApi;
