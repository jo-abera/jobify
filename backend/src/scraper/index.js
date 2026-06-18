// Import the scrapeTelegramChannels function from a separate file (telegramScraper.js)
// This function presumably contains the logic to scrape job posts from Telegram channels
// Main function that runs the scraping process
// Declared as 'async' because scraping likely involves waiting on network requests

const { scrapeTelegramChannels } = require("./telegramScraper");

async function scrapeJobs() {
  console.log("Scraper started..."); // Log message to show the process has begun

  await scrapeTelegramChannels();

  console.log("Scraper finished"); // Log message to confirm the process is done
}
module.exports = { scrapeJobs };

// Wait for the Telegram scraping to complete before moving on
// 'await' pauses execution here until the promise resolves
// Export scrapeJobs so it can be imported and used in other files (e.g., a main app file or a scheduler)
