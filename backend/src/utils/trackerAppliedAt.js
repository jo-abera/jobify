/**
 * appliedAt column support when Prisma client is behind schema (dev on Windows).
 * Reads/writes via SQL; merges onto SavedJob objects for API responses.
 */

async function readAppliedAt(prisma, savedJobId, userId) {
  const rows = await prisma.$queryRaw`
    SELECT "appliedAt" FROM "SavedJob"
    WHERE id = ${savedJobId} AND "userId" = ${userId}
  `;
  return rows[0]?.appliedAt ?? null;
}

async function writeAppliedAt(prisma, savedJobId, userId, value) {
  if (value === null) {
    await prisma.$executeRaw`
      UPDATE "SavedJob" SET "appliedAt" = NULL
      WHERE id = ${savedJobId} AND "userId" = ${userId}
    `;
    return;
  }
  await prisma.$executeRaw`
    UPDATE "SavedJob" SET "appliedAt" = ${value}
    WHERE id = ${savedJobId} AND "userId" = ${userId}
  `;
}

async function appliedAtMapForUser(prisma, userId) {
  const rows = await prisma.$queryRaw`
    SELECT id, "appliedAt" FROM "SavedJob" WHERE "userId" = ${userId}
  `;
  const map = new Map();
  for (const row of rows) {
    map.set(row.id, row.appliedAt ?? null);
  }
  return map;
}

function attachAppliedAt(rows, map) {
  return rows.map((row) => ({
    ...row,
    appliedAt: map.has(row.id) ? map.get(row.id) : row.appliedAt ?? null,
  }));
}

module.exports = {
  readAppliedAt,
  writeAppliedAt,
  appliedAtMapForUser,
  attachAppliedAt,
};