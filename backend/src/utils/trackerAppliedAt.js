/**
 * appliedAt / followUpAt when Prisma client is behind schema (dev on Windows).
 * Reads/writes via SQL; merges onto SavedJob objects for API responses.
 */

async function readDateFields(prisma, savedJobId, userId) {
  const rows = await prisma.$queryRaw`
  SELECT "appliedAt", "followUpAt" FROM "SavedJob"
  WHERE id = ${savedJobId} AND "userId" = ${userId}
  `;
  const row = rows[0];
  return {
    appliedAt: row?.appliedAt ?? null,
    followUpAt: row?.followUpAt ?? null,
  };
}

async function readAppliedAt(prisma, savedJobId, userId) {
  const { appliedAt } = await readDateFields(prisma, savedJobId, userId);
  return appliedAt;
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

async function writeFollowUpAt(prisma, savedJobId, userId, value) {
  if (value === null) {
    await prisma.$executeRaw`
      UPDATE "SavedJob" SET "followUpAt" = NULL
      WHERE id = ${savedJobId} AND "userId" = ${userId}
    `;
    return;
  }
  await prisma.$executeRaw`
    UPDATE "SavedJob" SET "followUpAt" = ${value}
    WHERE id = ${savedJobId} AND "userId" = ${userId}
  `;
}

async function dateFieldsMapForUser(prisma, userId) {
  const rows = await prisma.$queryRaw`
    SELECT id, "appliedAt", "followUpAt" FROM "SavedJob" WHERE "userId" = ${userId}
  `;
  const map = new Map();
  for (const row of rows) {
    map.set(row.id, {
      appliedAt: row.appliedAt ?? null,
      followUpAt: row.followUpAt ?? null,
    });
  }
  return map;
}

/** @deprecated use dateFieldsMapForUser */
async function appliedAtMapForUser(prisma, userId) {
  const map = await dateFieldsMapForUser(prisma, userId);
  const appliedOnly = new Map();
  for (const [id, fields] of map) {
    appliedOnly.set(id, fields.appliedAt);
  }
  return appliedOnly;
}

function attachDateFields(rows, map) {
  return rows.map((row) => {
    const fields = map.get(row.id);
    return {
      ...row,
      appliedAt: fields?.appliedAt ?? row.appliedAt ?? null,
      followUpAt: fields?.followUpAt ?? row.followUpAt ?? null,
    };
  });
}

/** @deprecated use attachDateFields */
function attachAppliedAt(rows, map) {
  return rows.map((row) => ({
    ...row,
    appliedAt: map.has(row.id) ? map.get(row.id) : row.appliedAt ?? null,
  }));
}

module.exports = {
  readDateFields,
  readAppliedAt,
  writeAppliedAt,
  writeFollowUpAt,
  dateFieldsMapForUser,
  appliedAtMapForUser,
  attachDateFields,
  attachAppliedAt,
};