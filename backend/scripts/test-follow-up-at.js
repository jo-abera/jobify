require("dotenv").config({ override: true });
const prisma = require("../src/config/db");
const { writeFollowUpAt, readDateFields } = require("../src/utils/trackerAppliedAt");

async function main() {
  const row = await prisma.savedJob.findFirst();
  if (!row) {
    console.log("No SavedJob rows");
    return;
  }
  const when = new Date("2026-11-28T12:00:00.000Z");
  await writeFollowUpAt(prisma, row.id, row.userId, when);
  const fields = await readDateFields(prisma, row.id, row.userId);
  console.log("OK", fields.followUpAt);
}

main()
  .catch((e) => {
    console.error("FAIL", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());