require('dotenv').config({ override: true });
const prisma = require('../src/config/db');

async function main() {
  const row = await prisma.savedJob.findFirst();
  if (!row) {
    console.log('No SavedJob rows');
    return;
  }
  try {
    const updated = await prisma.savedJob.update({
      where: { id: row.id },
      data: { appliedAt: new Date('2026-11-26T12:00:00.000Z') },
    });
    console.log('OK', updated.appliedAt);
  } catch (e) {
    console.error('FAIL', e.message);
    process.exit(1);
  }
}

main().finally(() => prisma.$disconnect());