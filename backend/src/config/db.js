/**
 * Shared Prisma client singleton instance for database access across the application.
 * 
 * Imported by controllers, the scraper, and seed script. A single instance 
 * avoides exhausting database connections under Express's concurrent requests.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = prisma;
