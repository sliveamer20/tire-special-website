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

// Selecting a grid row (single click -> onGRS) swaps the values shown in the
// "#item" specifications widget client-side (no server round trip, ~50ms).
// The widget's #dtlItem span mirrors the row's data-id, so we use that as the
// correlation key to confirm the widget has caught up with the row we clicked
// before reading its fields.
function emptySpecifications() {
  return {
    brand: null,
    category: null,
    tread: null,
    utqg: null,
    mileageWarranty: null,
    origin: null,
    dot: null,
    plyRating: null,
    loadIndex: null,
    speedRating: null,
    manufacturingDate: null,
    cubicFt: null,
    purchaseType: null,
    contLoad40HC: null,
    exportOnly: null,
    approxWeightLbs: null,
    eMark: null,
    fet: null,
    flapIncluded: null,
    sMark: null,
    manufacturer: null,
    duty: null
  };
}

async function fetchRowSpecifications(page, itemId, rowIndex) {
  if (!itemId) return emptySpecifications();

  try {
    const current = await page.locator('#dtlItem').textContent().catch(() => null);
    if (current?.trim() !== itemId) {
      await page.locator('#ctl00_PageContent_ItemGrid tbody tr').nth(rowIndex).click();
      await page.waitForFunction(
        (expected) => document.querySelector('#dtlItem')?.textContent?.trim() === expected,
        itemId,
        { timeout: 5000 }
      );
    }

    return await page.evaluate(() => {
      const val = (id) => {
        const text = document.querySelector('#' + id)?.textContent?.trim();
        return text ? text : null;
      };
      return {
        brand: val('dtlBrand'),
        category: val('dtlCategory'),
        tread: val('dtlTread'),
        utqg: val('dtlUTQG'),
        mileageWarranty: val('dtlMileWty'),
        origin: val('dtlOrigin'),
        dot: val('dtlDOT'),
        plyRating: val('dtlPlyRating'),
        loadIndex: val('dtlLoadIndex'),
        speedRating: val('dtlSpeedIndex'),
        manufacturingDate: val('dtlDate'),
        cubicFt: val('dtlVolume'),
        purchaseType: val('dtlPurchaseType'),
        contLoad40HC: val('dtlContLdIndx'),
        exportOnly: val('dtlExportOnly'),
        approxWeightLbs: val('dtlWeight'),
        eMark: val('dtlEMark'),
        fet: val('dtlFET'),
        flapIncluded: val('dtlFlapIncl'),
        sMark: val('dtlSMark'),
        manufacturer: val('dtlManufacturer'),
        duty: val('dtlDutyYN')
      };
    });
  } catch {
    return emptySpecifications();
  }
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
        wholesaleText: text('.priceCell'),
        itemId: row.getAttribute('data-id')
      };
    })
  );

  const results = [];
  for (let i = 0; i < rawRows.length; i += 1) {
    const row = rawRows[i];
    const wholesaleCost = parseWholesalePrice(row.wholesaleText);
    const specifications = await fetchRowSpecifications(page, row.itemId, i);
    results.push({
      description: row.description,
      partCode: row.partCode,
      speedIndex: row.speedIndex,
      availability: row.availability,
      retailPrice: wholesaleCost === null ? null : calculateRetailTiers(wholesaleCost),
      specifications
    });
  }
  return results;
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
