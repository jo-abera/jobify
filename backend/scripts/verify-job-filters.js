/**
 * Verify job filters: DB fields + GET /api/jobs query params.
 * Usage: node scripts/verify-job-filters.js [baseUrl]
 */
require('dotenv').config({ override: true });

const prisma = require('../src/config/db');
const { buildJobListFilters } = require('../src/utils/jobQueryFilters');

const baseUrl = process.argv[2] || `http://localhost:${process.env.PORT || 5000}`;

async function countWhere(where) {
  return prisma.job.count({ where });
}

async function checkDb() {
  const sample = await prisma.job.findFirst({
    select: {
      id: true,
      category: true,
      workMode: true,
      experienceLevel: true,
      source: true,
      postedAt: true,
    },
  });

  let clientOk = true;
  try {
    await prisma.job.count({ where: { workMode: 'Remote' } });
  } catch (e) {
    clientOk = false;
    console.error('DB filter failed:', e.message);
  }

  const dist = await prisma.job.groupBy({
    by: ['workMode'],
    _count: true,
  });

  return { sample, clientOk, workModeDist: dist };
}

async function fetchJson(path) {
  const res = await fetch(`${baseUrl}${path}`);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 200) };
  }
  return { status: res.status, data };
}

async function main() {
  console.log('=== Database ===');
  const db = await checkDb();
  console.log(JSON.stringify(db, null, 2));

  if (!db.clientOk) {
    console.log('\nFix: stop the API, run `npx prisma generate`, rerun backfill if needed.');
    process.exit(1);
  }

  const cases = [
    { name: 'filters meta', path: '/api/jobs/filters' },
    { name: 'all (default window)', path: '/api/jobs?limit=1' },
    { name: 'category=Engineering', path: '/api/jobs?category=Engineering&limit=5' },
    { name: 'workMode=Remote', path: '/api/jobs?workMode=Remote&limit=5' },
    { name: 'experienceLevel=Senior', path: '/api/jobs?experienceLevel=Senior&limit=5' },
    { name: 'postedWithin=30', path: '/api/jobs?postedWithin=30&limit=5' },
    { name: 'sourceSite=telegram', path: '/api/jobs?sourceSite=telegram&limit=5' },
    {
      name: 'combined',
      path: '/api/jobs?category=Engineering&workMode=Remote&limit=5',
    },
  ];

  console.log('\n=== HTTP API (%s) ===', baseUrl);
  let apiOk = true;
  for (const c of cases) {
    const { status, data } = await fetchJson(c.path);
    const total =
      data?.pagination?.total ?? (Array.isArray(data) ? data.length : null);
    const jobs = data?.jobs?.length ?? (Array.isArray(data) ? data.length : 0);
    const ok = status === 200;
    if (!ok) apiOk = false;
    console.log(
      JSON.stringify({
        case: c.name,
        status,
        ok,
        total,
        jobsReturned: jobs,
        filterKeys: data?.categories ? 'meta' : undefined,
      })
    );
  }

  const where = buildJobListFilters({
    category: 'Engineering',
    workMode: 'Remote',
  });
  const prismaTotal = await countWhere(where);
  console.log('\n=== Prisma cross-check (Engineering + Remote) ===');
  console.log({ prismaTotal, where: JSON.stringify(where) });

  if (!apiOk) {
    console.log('\nAPI not reachable or errors — is the backend running on', baseUrl, '?');
    process.exit(2);
  }
  console.log('\nVerification finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());