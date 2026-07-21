const { chromium } = require('playwright');
const { withRetry } = require('../utils/retry');
const sessionManager = require('./sessionManager');

// NOT IMPLEMENTED YET (Phase 3): supplier URL, form selectors and credential
// submission go here. Left as a stub so no supplier-specific logic or
// selectors exist until that phase is explicitly approved.
async function login(context) {
  throw new Error('Supplier login is not implemented yet (Phase 3).');
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

module.exports = { withBrowser };
