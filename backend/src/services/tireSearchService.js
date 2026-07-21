const { TtlCache } = require('./cache');
const { withBrowser } = require('./supplierClient');
const { withRetry } = require('../utils/retry');
const env = require('../config/env');

const searchCache = new TtlCache(env.searchCacheTtlMs);

// NOT IMPLEMENTED YET (Phase 3): navigating the supplier's search page and
// scraping results goes here. Left as a stub — this phase only wires up
// caching, session reuse and retry around the eventual real search.
async function runSupplierSearch(query) {
  return withBrowser(async (page) => {
    throw new Error('Supplier tire search is not implemented yet (Phase 3).');
  });
}

async function searchTires(query) {
  const cacheKey = JSON.stringify(query);
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const result = await withRetry(() => runSupplierSearch(query), { retries: 3 });

  searchCache.set(cacheKey, result);
  return result;
}

module.exports = { searchTires };
