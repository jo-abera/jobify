/**
 * Remotive public API — remote jobs from many companies (no API key).
 * https://remotive.com/api/remote-jobs
 */

const axios = require('axios')

const SOURCE = 'remotive.com'

async function fetchJobs() {
  const { data } = await axios.get('https://remotive.com/api/remote-jobs', {
    timeout: 15000,
    headers: { 'User-Agent': 'JobifyBot/1.0' }
  })

  return (data.jobs || []).map((job) => ({
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location || 'Remote',
    salary: job.salary || null,
    url: job.url,
    description: stripHtml(job.description || '').slice(0, 5000),
    type: normalizeType(job.job_type),
    source: SOURCE
  }))
}

function normalizeType(value) {
  if (!value) return 'Full-time'
  const lower = String(value).toLowerCase()
  if (lower.includes('part')) return 'Part-time'
  if (lower.includes('contract')) return 'Contract'
  if (lower.includes('intern')) return 'Internship'
  return 'Full-time'
}

function stripHtml(html) {
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

module.exports = { name: SOURCE, fetchJobs }
