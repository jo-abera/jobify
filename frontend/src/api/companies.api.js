import api from './axios';

export const listCompanies = () => api.get('/api/companies');
export const getCompanyBySlug = (slug) => api.get(`/api/companies/${slug}`);