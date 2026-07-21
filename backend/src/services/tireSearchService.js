const { TtlCache } = require('./cache');
const { withBrowser, resolvePortalHomeUrl } = require('./supplierClient');
const { withRetry } = require('../utils/retry');
const sessionManager = require('./sessionManager');
const env = require('../config/env');

const searchCache = new TtlCache(env.searchCacheTtlMs);

function buildSizeQuery({ width, ratio, diameter }) {
  return `${width}${ratio}${diameter}`;
}

// Deliberately never selects .priceCell / .FETCell — wholesale price and tax
// figures must never be read out of the page, let alone returned to a client.
async function extractResults(page) {
  const noDataVisible = await page.locator('#ctl00_PageContent_NoDataMsg').count();
  if (noDataVisible > 0) return [];

  return page.$$eval('#ctl00_PageContent_ItemGrid tbody tr', (rows) =>
    rows.map((row) => {
      const text = (selector) => row.querySelector(selector)?.textContent?.trim() || '';
      return {
        description: text('.descrCell'),
        partCode: text('.mfgPcCell'),
        speedIndex: text('.speedIndexCell'),
        availability: text('.availCell')
      };
    })
  );
}

async function runSupplierSearch(query) {
  return withBrowser(async (page) => {
    await page.goto(resolvePortalHomeUrl(), { waitUntil: 'domcontentloaded', timeout: 30000 });

    if (page.url().includes('frmLogin.aspx')) {
      // The reused session was rejected by the server despite passing our TTL
      // check — clear it so the next retry performs a real login instead.
      sessionManager.clearSession();
      throw new Error('Supplier session was invalid; retrying with a fresh login.');
    }

    const sizeQuery = buildSizeQuery(query);
    await page.fill('#ctl00_PageContent_txtSearch', sizeQuery);
    await page.click('#ctl00_PageContent_imbSearch');
    await page.waitForFunction(
      () =>
        document.querySelector('#ctl00_PageContent_ItemGrid') ||
        document.querySelector('#ctl00_PageContent_NoDataMsg'),
      { timeout: 20000 }
    );

    return extractResults(page);
  });
}

async function searchTires(query) {
  const cacheKey = JSON.stringify(query);
  const cached = searchCache.get(cacheKey);
  if (cached) return cached;

  const results = await withRetry(() => runSupplierSearch(query), { retries: 3 });

  searchCache.set(cacheKey, results);
  return results;
}

module.exports = { searchTires };
