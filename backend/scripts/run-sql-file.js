require("dotenv").config({ override: true });
const fs = require("fs");
const path = require("path");
const prisma = require("../src/config/db");

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/run-sql-file.js <path-to.sql>");
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(file), "utf8");

async function main() {
  await prisma.$executeRawUnsafe(sql);
  console.log("OK", file);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());