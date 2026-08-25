/**
 * Admin API client — /api/admin/*
 *
 * All endpoints require an admin JWT (axios interceptor attaches Bearer token).
 * Used exclusively by AdminDashboard.jsx.
 */

import api from './axios'

export const getStats = () => api.get('/api/admin/stats')

export const adminGetAllJobs = () => api.get('/api/admin/jobs')
export const adminCreateJob = (data) => api.post('/api/admin/jobs', data)
export const adminUpdateJob = (id, data) => api.patch(`/api/admin/jobs/${id}`, data)
export const adminDeleteJob = (id) => api.delete(`/api/admin/jobs/${id}`)

export const adminGetAllUsers = () => api.get('/api/admin/users')
export const adminBanUser = (id) => api.patch(`/api/admin/users/${id}/ban`)
export const adminUnbanUser = (id) => api.patch(`/api/admin/users/${id}/unban`)
export const adminPromoteUser = (id) => api.patch(`/api/admin/users/${id}/promote`)
export const adminDeleteUser = (id) => api.delete(`/api/admin/users/${id}`)

export const runScraper = () => api.post('/api/admin/scraper/run')
