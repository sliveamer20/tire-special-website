require('dotenv').config({ quiet: true });

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigin: process.env.ALLOWED_ORIGIN || '*',

  supplierPortalUrl: process.env.SUPPLIER_PORTAL_URL || '',
  supplierUsername: process.env.SUPPLIER_USERNAME || '',
  supplierPassword: process.env.SUPPLIER_PASSWORD || '',

  // How long a saved Playwright session is trusted before a fresh login is required.
  sessionTtlMs: Number(process.env.SESSION_TTL_MS) || 12 * 60 * 60 * 1000, // 12h default
  // How long search results are served from cache before hitting the supplier again.
  searchCacheTtlMs: Number(process.env.SEARCH_CACHE_TTL_MS) || 5 * 60 * 1000 // 5min default
};
