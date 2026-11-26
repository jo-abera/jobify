/** Jobs API — public listing and home stats. */
import api from './axios';

export const getJobs = (params) => api.get('/api/jobs', { params });
export const getJobFilterOptions = () => api.get('/api/jobs/filters');
export const getCategoryCounts = (params) =>
  api.get('/api/jobs/category-counts', { params });
export const getJobById = (id) => api.get(`/api/jobs/${id}`);
export const getStats = () => api.get('/api/jobs/stats');
