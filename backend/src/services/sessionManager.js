const fs = require('fs');
const path = require('path');
const env = require('../config/env');

const DATA_DIR = env.sessionDataDir || path.join(__dirname, '..', '..', 'data');
const STORAGE_STATE_PATH = path.join(DATA_DIR, 'storageState.json');
const SESSION_META_PATH = path.join(DATA_DIR, 'session-meta.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readMeta() {
  if (!fs.existsSync(SESSION_META_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(SESSION_META_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

function hasValidSession() {
  if (!fs.existsSync(STORAGE_STATE_PATH)) return false;
  const meta = readMeta();
  if (!meta || !meta.expiresAt) return false;
  return Date.now() < meta.expiresAt;
}

function saveSession(storageState) {
  ensureDataDir();
  fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(storageState));
  fs.writeFileSync(
    SESSION_META_PATH,
    JSON.stringify({ savedAt: Date.now(), expiresAt: Date.now() + env.sessionTtlMs })
  );
}

function clearSession() {
  if (fs.existsSync(STORAGE_STATE_PATH)) fs.unlinkSync(STORAGE_STATE_PATH);
  if (fs.existsSync(SESSION_META_PATH)) fs.unlinkSync(SESSION_META_PATH);
}

module.exports = {
  STORAGE_STATE_PATH,
  hasValidSession,
  saveSession,
  clearSession
};
