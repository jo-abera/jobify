/** Tracker API — saved jobs and kanban status (auth required). */

import api from './axios';

export const getSavedJobs = () => api.get('/api/tracker');
export const saveJob = (jobId) => api.post('/api/tracker', { jobId });
export const updateStatus = (id, data) => api.patch(`/api/tracker/${id}`, data);
export const removeJob = (id) => api.delete(`/api/tracker/${id}`);
