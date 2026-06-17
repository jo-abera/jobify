/**
 * Job scraper — fetches career pages and upserts Job rows (unique on url).
 *
 * Invoked by the daily scheduler and POST /api/admin/scraper/run.
 * Configure target sites in the `sites` array; selectors are placeholders per site.
 */

const axios = require("axios");
const cheerio = require("cheerio");
const prisma = require("../config/db");

/**
 * Iterates configured career pages, parses listings, and upserts into Prisma.
 * Safe to run when `sites` is empty (no-op with log message).
 */
async function scrapeJobs() {
  console.log("Scraper started...");

  const sites = [
    // { url: 'https://example.com/careers', company: 'Example Company' }
  ];

  if (sites.length === 0) {
    console.log("Scraper finished — no sites configured");
    return;
  }

  for (const site of sites) {
    try {
      const { data } = await axios.get(site.url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        timeout: 10000,
      });

      const $ = cheerio.load(data);
      const jobs = [];

      $(".job-listing").each((i, el) => {
        jobs.push({
          title: $(el).find(".job-title").text().trim(),
          company: site.company,
          location: $(el).find(".location").text().trim() || "Remote",
          url: $(el).find("a").attr("href"),
          description: $(el).find(".description").text().trim(),
          source: site.url,
          type: "Full-time",
        });
      });

      for (const job of jobs) {
        if (!job.url || !job.title) continue;
        await prisma.job.upsert({
          where: { url: job.url },
          update: {},
          create: job,
        });
      }

      console.log(`Scraped ${jobs.length} jobs from ${site.company}`);
    } catch (err) {
      console.error(`Failed to scrape ${site.company}:`, err.message);
    }
  }

  console.log("Scraper finished");
}

module.exports = { scrapeJobs };
