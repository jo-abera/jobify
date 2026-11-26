/** Telegram channels scraped by Jobify (keep in sync with telegramScraper.js). */
const TELEGRAM_CHANNELS = [
  '@josad_software',
  '@freelance_ethio',
  '@geezjobs_ethiopia',
  '@hahujobs',
  '@effoyjobs',
  '@addis_zemen_vacancy',
  '@Maroset',
];

const SOURCE_SITE_OPTIONS = [
  { value: 'manual', label: 'Manual / admin' },
  { value: 'telegram', label: 'All Telegram channels' },
  ...TELEGRAM_CHANNELS.map((ch) => ({
    value: ch.replace('@', '').toLowerCase(),
    label: ch,
  })),
];

function isValidSourceSite(value) {
  if (!value || typeof value !== 'string') return false;
  const v = value.toLowerCase();
  if (v === 'manual' || v === 'telegram') return true;
  return TELEGRAM_CHANNELS.some((ch) => ch.replace('@', '').toLowerCase() === v);
}

module.exports = {
  TELEGRAM_CHANNELS,
  SOURCE_SITE_OPTIONS,
  isValidSourceSite,
};