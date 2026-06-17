/**
 * Upsert scraped jobs into the database (unique on url).
 */

const prisma = require('../config/db')

async function upsertJobs(jobs, source) {
  let saved = 0

  for (const job of jobs) {
    if (!job.url || !job.title || !job.company) continue

    await prisma.job.upsert({
      where: { url: job.url },
      update: {
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        description: job.description,
        type: job.type,
        source: job.source || source
      },
      create: {
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary || null,
        url: job.url,
        description: job.description,
        type: job.type || 'Full-time',
        source: job.source || source
      }
    })
    saved++
  }

  return saved
}

module.exports = { upsertJobs }
