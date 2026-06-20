// Import the Prisma client instance (used to save jobs to the database)
const prisma = require("../config/db");

// Will hold the Telegram bot instance once created (singleton pattern)
let bot;

// Creates (or reuses) a single Telegram bot instance
// Using a singleton avoids creating a new bot connection every time it's needed
async function getTelegramBot() {
  if (!bot) {
    // node-telegram-bot-api is an ESM-only module, so it must be dynamically imported
    // even inside a CommonJS (require-based) file
    const telegramModule = await import("node-telegram-bot-api");
    const TelegramBot = telegramModule.default || telegramModule;

    // polling: false because we're NOT listening for live messages/commands here —
    // we only use the bot to fetch chat info, not to receive updates
    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  }
  return bot;
}

// List of Telegram channel usernames to scrape for job postings
// Each comment is just a human-readable label for the channel
const channels = [
  "@josad_software", // Josad software Jobs
  "@freelance_ethio", // Afriwork
  "@geezjobs_ethiopia", // GeezJobs
  "@hahujobs", // Hahu Jobs
  "@effoyjobs", // Effoy Jobs
  "@addis_zemen_vacancy", // Addis Zemen
  "@Maroset", // Maroset
  // "@elelanajobs", // Elelana Jobs
];

/**
 * Parse raw Telegram message text into structured job fields
 * (title, company, location, salary, type, url, etc.)
 *
 * Telegram job posts come in many different formats depending on the channel,
 * so this function tries several regex patterns per field until one matches.
 */
function parseJobMessage(text, channelName) {
  if (!text) return null; // Skip empty messages entirely

  // ─── Normalize — add newlines before known keywords ──
  // Many messages have everything crammed onto one line (no line breaks),
  // so we force a newline before each known label to make the regexes below
  // more reliable at isolating each field
  const normalized = text
    .replace(/Job Title:/gi, "\nJob Title:")
    .replace(/Job Type:/gi, "\nJob Type:")
    .replace(/Work Location:/gi, "\nWork Location:")
    .replace(/Salary\/Compensation:/gi, "\nSalary/Compensation:")
    .replace(/Salary:/gi, "\nSalary:")
    .replace(/Deadline:/gi, "\nDeadline:")
    .replace(/Description:/gi, "\nDescription:")
    .replace(/Company:/gi, "\nCompany:")
    .replace(/Location:/gi, "\nLocation:")
    .replace(/Place of Work:/gi, "\nPlace of Work:")
    .replace(/Duty Station:/gi, "\nDuty Station:")
    .replace(/Employment Type:/gi, "\nEmployment Type:")
    .replace(/Working Hours:/gi, "\nWorking Hours:")
    .replace(/Experience Level:/gi, "\nExperience Level:")
    .replace(/Verified Company/gi, "\nVerified Company");

  // ─── Title — stop at Education: or ▪️ ──────────────
  // Tries each pattern in order (||) and uses the first one that matches.
  // Different channels label the job title differently, hence multiple patterns.
  const titleMatch =
    normalized.match(/Job Title[:\s]+([^\n\r]+)/i) ||
    // @elelanajobs — extract between "Job Position-" and "Education:" or "▪️Find"
    normalized.match(
      /Job Position[-\s]*\d*[-\s]*([^▪️\n]+?)(?=Education:|▪️Find)/i,
    ) ||
    // @freelance_ethio / general formats
    normalized.match(/Position\s*[-:]\s*\d*[:\s]*([^\n\r✅⏹️●■✔]+)/i) ||
    normalized.match(/Position[:\s]+([^\n\r]+)/i);

  // ─── Company — extract from between 🎴 emojis ───────
  const companyMatch =
    //normalized.match(/🎴([^🎴]+)🎴/i) || // ← @elelanajobs pattern
    normalized.match(/^Company[:\s]+([^(\n\r]+)/im) ||
    normalized.match(/^Organization[:\s]+([^\n\r]+)/im) ||
    normalized.match(/^Employer[:\s]+([^\n\r]+)/im) ||
    normalized.match(/★\s*([^★\n\r♦✅\d]+?)\s*(?:Job Vacancy|Vacancy|አዲስ)/i) ||
    normalized.match(/\n([^\n@]+)\nVerified Company/i) ||
    normalized.match(/__+\n([^\n✅]+)\n/i) ||
    // Fallback: look for a capitalized phrase ending in a common business suffix
    normalized.match(
      /([A-Z][a-zA-Z\s]+(?:PLC|S\.C|SC|Bank|Trading|Technologies|Insurance|Agency|Group))/,
    );

  // ─── Location ────────────────────────────────────────
  const locationMatch =
    normalized.match(/Work Location[:\s]+([^\n\r]+)/i) ||
    normalized.match(/Place of Work[:\s]+([^\n\r]+)/i) ||
    normalized.match(/Duty Station[:\s]+([^\n\r]+)/i) ||
    normalized.match(/^Location[:\s]+([^\n\r]+)/im);

  // ─── Salary ──────────────────────────────────────────
  const salaryMatch =
    normalized.match(/Salary\/Compensation[:\s]+([^\n\r]+)/i) ||
    normalized.match(/Salary[:\s]+([^\n\r]+)/i) ||
    // Fallback: try to spot a raw number followed by ETB/Birr
    normalized.match(/(\d[\d,]+\s*(?:ETB|Birr|birr))/i);

  // ─── Type ────────────────────────────────────────────
  const typeMatch =
    normalized.match(/Job Type[:\s]+([^\n\r]+?)(?:\s+Working Hours|$)/i) ||
    normalized.match(/Employment Type[:\s]+([^\n\r]+)/i);

  // ─── URL ─────────────────────────────────────────────
  // Note: matched against the original (un-normalized) text, not "normalized"
  const urlMatch = text.match(
    /(https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+)/,
  );

  // ─── Clean helper ─────────────────────────────────────
  // Strips decorative emojis/underscores, collapses whitespace,
  // trims, and truncates to a max length — used on every extracted field
  const clean = (str, limit = 150) =>
    str
      ?.trim()
      .replace(/[▪️•✅⏹️💧🎈❗️📌🔻★○●■✔♦🎴]/g, "")
      .replace(/__+/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, limit);

  // Apply the clean() helper to each matched field, with sensible fallback defaults
  const title = clean(titleMatch?.[1], 150);
  const company = clean(companyMatch?.[1], 100);
  const location = clean(locationMatch?.[1], 100) || "Addis Ababa, Ethiopia";
  const salary = clean(salaryMatch?.[1], 100) || null;
  const type = clean(typeMatch?.[1], 80) || "Full-time";
  const url = urlMatch?.[1]?.trim();

  // Reject messages that aren't actually valid job posts —
  // e.g. too short, or matched junk text instead of a real title
  if (
    !title ||
    title.length < 3 ||
    title.includes("------") ||
    title.includes("jobs-2026") ||
    title.startsWith("is open") ||
    title.startsWith("@")
  )
    return null;

  // Return a clean, structured job object ready to be saved to the database
  return {
    title,
    company: company || channelName, // fall back to channel name if no company found
    location,
    salary,
    type,
    url: url || `https://t.me/${channelName.replace("@", "")}`, // fallback URL if message has none
    description: text.trim().substring(0, 2000), // store original raw text (capped length)
    source: `https://t.me/${channelName.replace("@", "")}`,
  };
}

/**
 * Scrape recent messages from a Telegram channel
 */
async function scrapeChannel(channel) {
  try {
    console.log(`Scraping Telegram channel: ${channel}`);

    // Get (or create) the bot instance
    bot = await getTelegramBot();

    // Just used here to confirm the bot can "see" the channel and log its title
    const chat = await bot.getChat(channel);
    console.log(`Connected to: ${chat.title}`);

    // Note: to read channel messages you need the bot
    // to be an admin of the channel OR use Telegraph API
    // For public channels use the web preview approach below
    // (the bot API itself can't read public channel message history without admin rights)

    // Actual message fetching is done via web scraping, not the bot API (see below)
    const messages = await fetchPublicChannelMessages(channel);
    let saved = 0;

    // Try to parse each message into a job; skip ones that aren't valid job posts
    for (const msg of messages) {
      const job = parseJobMessage(msg.text, channel);
      if (!job) continue;

      // upsert = insert if new, otherwise leave existing record unchanged
      // (using the job URL as the unique key to avoid duplicate entries)
      await prisma.job.upsert({
        where: { url: job.url },
        update: {},
        create: job,
      });
      saved++;
    }

    console.log(`Saved ${saved} jobs from ${channel}`);
  } catch (err) {
    // Catch per-channel so one failing channel doesn't stop the whole scrape run
    console.error(`Failed to scrape ${channel}:`, err.message);
  }
}

/**
 * Fetch messages from public Telegram channels via t.me web preview
 * (this is the actual scraping step — bypasses the bot API limitation above
 * by reading the public HTML preview page Telegram exposes for public channels)
 */
async function fetchPublicChannelMessages(channel) {
  const axios = require("axios"); // for making the HTTP request
  const cheerio = require("cheerio"); // for parsing the returned HTML (jQuery-like)

  const channelName = channel.replace("@", "");
  const url = `https://t.me/s/${channelName}`; // Telegram's public "preview" page for the channel

  try {
    const { data } = await axios.get(url, {
      headers: {
        // Spoof a browser User-Agent so Telegram serves the full page
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      timeout: 15000, // give up after 15 seconds
    });

    const $ = cheerio.load(data); // load the HTML so we can query it like the DOM
    const messages = [];

    // Each message's text lives inside elements with this class on the t.me/s/ page
    $(".tgme_widget_message_text").each((i, el) => {
      messages.push({
        text: $(el).text().trim(),
      });
    });

    console.log(`Found ${messages.length} messages in ${channel}`);
    return messages;
  } catch (err) {
    console.error(`Failed to fetch ${channel}:`, err.message);
    return []; // fail gracefully — return an empty list rather than throwing
  }
}

/**
 * Main function — scrape all channels
 * Loops through every channel in the list sequentially (one at a time)
 */
async function scrapeTelegramChannels() {
  console.log("Telegram scraper started...");

  for (const channel of channels) {
    await scrapeChannel(channel); // wait for each channel to finish before moving to the next
  }

  console.log("Telegram scraper finished");
}

// Export only the main entry point — everything else stays private to this module
module.exports = { scrapeTelegramChannels };
