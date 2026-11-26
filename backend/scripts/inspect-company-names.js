require("dotenv").config({ override: true });
const prisma = require("../src/config/db");
const { groupJobsByCompanySlug } = require("../src/utils/companyProfile");
const { postedAtListingFilter } = require("../src/utils/jobListingWindow");

async function main() {
  const badTotal = await prisma.job.count({
    where: { company: { startsWith: "Description", mode: "insensitive" } },
  });
  const badSamples = await prisma.job.findMany({
    where: { company: { startsWith: "Description", mode: "insensitive" } },
    select: { id: true, company: true },
    take: 3,
  });
  console.log("DB rows with Description* company:", badTotal);
  console.log("samples:", badSamples);

  const all = await prisma.job.findMany({ where: postedAtListingFilter() });
  const g = groupJobsByCompanySlug(all, { directoryOnly: true });
  const companies = [...g.entries()].map(([slug, jobs]) => ({
    slug,
    name: jobs[0]?.company,
    count: jobs.length,
  }));
  const suspicious = companies.filter(
    (c) =>
      /^description/i.test(c.name || "") ||
      (c.count === 1 && (c.name?.length || 0) > 60),
  );
  console.log("Active company groups:", companies.length);
  console.log("Suspicious groups:", suspicious.length);
  console.log("Top single-job groups:", companies.filter((c) => c.count === 1).slice(0, 8));
  console.log(
    "Suspicious:",
    suspicious.map((c) => `${c.name?.slice(0, 55)} (${c.count})`),
  );

  if (prisma.company?.findMany) {
    try {
      const stored = await prisma.company.findMany({ take: 20 });
      const badStored = stored.filter((c) => /^description/i.test(c.name || ""));
      console.log("Stored Company rows:", stored.length, "bad names:", badStored.length);
      if (badStored[0]) console.log("bad stored sample:", badStored[0]);
    } catch (e) {
      console.log("Company table:", e.code || e.message);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());