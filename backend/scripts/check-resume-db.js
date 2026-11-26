require("dotenv").config({ override: true });
const prisma = require("../src/config/db");

async function main() {
  const cols = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'User' AND column_name LIKE 'resume%'
    ORDER BY column_name
  `;
  const table = await prisma.$queryRaw`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'ResumeVersion'
    ) AS exists
  `;
  console.log("User resume columns:", cols);
  console.log("ResumeVersion table:", table[0]?.exists);

  try {
    await prisma.resumeVersion.findFirst({ take: 1 });
    console.log("Prisma resumeVersion model: OK");
  } catch (e) {
    console.log("Prisma resumeVersion model: FAIL", e.message);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());