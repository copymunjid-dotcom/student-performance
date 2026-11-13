/**
 * Unified API Client for Student Performance Prediction Dashboard
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = localStorage.getItem('sppd_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, err);
    throw err;
  }
}

export const api = {
  // Authentication
  login: async (email, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register: async (userData) => {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    return request('/dashboard/stats');
  },

  // Students CRUD
  getStudents: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.department) query.set('department', params.department);
    if (params.academic_year) query.set('academic_year', params.academic_year);
    if (params.risk) query.set('risk', params.risk);
    
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/students${queryString}`);
  },

  getStudentById: async (id) => {
    return request(`/students/${id}`);
  },

  addStudent: async (studentData) => {
    return request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  },

  updateStudent: async (id, studentData) => {
    return request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  },

  deleteStudent: async (id) => {
    return request(`/students/${id}`, {
      method: 'DELETE'
    });
  },

  // Academic Performance
  savePerformance: async (perfData) => {
    return request('/performance', {
      method: 'POST',
      body: JSON.stringify(perfData)
    });
  },

  // Machine Learning Prediction
  predictPerformance: async (metricsData) => {
    return request('/predict', {
      method: 'POST',
      body: JSON.stringify(metricsData)
    });
  },

  // Student Risk Analysis
  getRiskAnalysis: async () => {
    return request('/risk-analysis');
  },

  // Reports
  getReports: async (type = 'overview') => {
    return request(`/reports?type=${type}`);
  },

  // Model Evaluation Metrics
  getModelMetrics: async () => {
    return request('/model-metrics');
  },

  // Recent Predictions
  getPredictions: async () => {
    return request('/predictions');
  },

  // Health
  checkHealth: async () => {
    return request('/health');
  }
};
