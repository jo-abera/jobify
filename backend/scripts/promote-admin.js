/**
 * CLI: promote a user to admin by email.
 * Usage: node scripts/promote-admin.js user@example.com
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const email = process.argv[2]
if (!email) {
  console.error('Usage: node scripts/promote-admin.js <email>')
  process.exit(1)
}

prisma.user
  .update({ where: { email }, data: { role: 'admin' } })
  .then((u) => {
    console.log(`Promoted ${u.name} (${u.email}) to admin`)
  })
  .catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
