/**
 * Arbeitnow public API — jobs from EU/global boards (no API key).
 * https://www.arbeitnow.com/api/job-board-api
 */

const axios = require('axios')

const SOURCE = 'arbeitnow.com'

async function fetchJobs() {
  const { data } = await axios.get('https://www.arbeitnow.com/api/job-board-api', {
    timeout: 15000,
    headers: { 'User-Agent': 'JobifyBot/1.0' }
  })

  return (data.data || []).map((job) => ({
    title: job.title,
    company: job.company_name,
    location: job.remote ? 'Remote' : (job.location || 'On-site'),
    salary: null,
    url: job.url,
    description: stripHtml(job.description || '').slice(0, 5000),
    type: normalizeType(job.job_types),
    source: SOURCE
  }))
}

function normalizeType(jobTypes) {
  if (!Array.isArray(jobTypes) || jobTypes.length === 0) return 'Full-time'
  const value = String(jobTypes[0]).toLowerCase()
  if (value.includes('part')) return 'Part-time'
  if (value.includes('contract') || value.includes('freelance')) return 'Contract'
  if (value.includes('intern')) return 'Internship'
  return 'Full-time'
}

function stripHtml(html) {
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

module.exports = { name: SOURCE, fetchJobs }
