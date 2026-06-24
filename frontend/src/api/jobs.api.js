/** Jobs API — public listing and home stats. */

import api from './axios';

export const getJobs = (params) => api.get('/api/jobs', { params });
export const getJobById = (id) => api.get(`/api/jobs/${id}`);
export const getStatus = () => api.get('/api/jobs/stats');
