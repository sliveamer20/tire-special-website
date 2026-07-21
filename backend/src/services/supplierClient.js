const { chromium } = require('playwright');
const { withRetry } = require('../utils/retry');
const sessionManager = require('./sessionManager');
const env = require('../config/env');

// Derives the authenticated landing page URL (e.g. cpgCustService.aspx) from
// the login page's own ReturnUrl, so nothing but SUPPLIER_PORTAL_URL is configured.
function resolvePortalHomeUrl() {
  try {
    const loginUrl = new URL(env.supplierPortalUrl);
    const returnUrl = loginUrl.searchParams.get('ReturnUrl');
    if (returnUrl) return new URL(decodeURIComponent(returnUrl), loginUrl.origin).toString();
    return loginUrl.origin;
  } catch {
    return env.supplierPortalUrl;
  }
}

async function login(context) {
  const page = await context.newPage();
  try {
    await page.goto(env.supplierPortalUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    await page.fill('#txtUserName', env.supplierUsername);
    await page.fill('#txtPassword', env.supplierPassword);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
      page.click('#btnSubmit')
    ]);

    const errorText = (await page.locator('#Message').textContent().catch(() => '')) || '';
    const stillOnLoginPage = page.url().includes('frmLogin.aspx');
    if (stillOnLoginPage || errorText.trim()) {
      throw new Error(`Supplier login failed${errorText.trim() ? `: ${errorText.trim()}` : ''}`);
    }
  } finally {
    await page.close();
  }
}

async function getAuthenticatedContext(browser) {
  if (sessionManager.hasValidSession()) {
    return browser.newContext({ storageState: sessionManager.STORAGE_STATE_PATH });
  }

  const context = await browser.newContext();
  await withRetry(() => login(context), { retries: 3 });

  const storageState = await context.storageState();
  sessionManager.saveSession(storageState);

  return context;
}

async function withBrowser(fn) {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await getAuthenticatedContext(browser);
    try {
      const page = await context.newPage();
      return await fn(page);
    } finally {
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

module.exports = { withBrowser, resolvePortalHomeUrl };
