const { TtlCache } = require('./cache');
const { withBrowser, resolvePortalHomeUrl } = require('./supplierClient');
const { withRetry } = require('../utils/retry');
const sessionManager = require('./sessionManager');
const { calculateRetailTiers } = require('./pricing');
const env = require('../config/env');

const searchCache = new TtlCache(env.searchCacheTtlMs);

function buildSizeQuery({ width, ratio, diameter }) {
  return `${width}${ratio}${diameter}`;
}

function parseWholesalePrice(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

// .priceCell ("Your Price") is read here ONLY to compute retail markup tiers.
// The raw wholesale number is never included in the object returned below —
// every field of the response is built explicitly, nothing is ever spread
// from the raw scraped row, so wholesale cost cannot leak through this path.
async function extractResults(page) {
  const noDataVisible = await page.locator('#ctl00_PageContent_NoDataMsg').count();
  if (noDataVisible > 0) return [];

  const rawRows = await page.$$eval('#ctl00_PageContent_ItemGrid tbody tr', (rows) =>
    rows.map((row) => {
      const text = (selector) => row.querySelector(selector)?.textContent?.trim() || '';
      return {
        description: text('.descrCell'),
        partCode: text('.mfgPcCell'),
        speedIndex: text('.speedIndexCell'),
        availability: text('.availCell'),
        wholesaleText: text('.priceCell')
      };
    })
  );

  return rawRows.map((row) => {
    const wholesaleCost = parseWholesalePrice(row.wholesaleText);
    return {
      description: row.description,
      partCode: row.partCode,
      speedIndex: row.speedIndex,
      availability: row.availability,
      retailPrice: wholesaleCost === null ? null : calculateRetailTiers(wholesaleCost)
    };
  });
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
