const { PrismaClient } = require("@prisma/client");
const c = new PrismaClient();
console.log("resumeVersion delegate:", typeof c.resumeVersion);
console.log("user resume fields in client:", Boolean(c.user));
c.$disconnect();