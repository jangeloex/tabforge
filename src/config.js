import os from 'os';
import path from 'path';
import fs from 'fs';

const DEFAULT_CONFIG_DIR = path.join(os.homedir(), '.tabforge');
const CONFIG_FILE = path.join(DEFAULT_CONFIG_DIR, 'config.json');

const DEFAULTS = {
  storeDir: path.join(DEFAULT_CONFIG_DIR, 'store'),
  gitRemote: null,
  browser: 'auto',
  syncOnStart: false,
};

export function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    return { ...DEFAULTS };
  }

  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch (err) {
    throw new Error(`Failed to parse config file at ${CONFIG_FILE}: ${err.message}`);
  }
}

export function saveConfig(config) {
  if (!fs.existsSync(DEFAULT_CONFIG_DIR)) {
    fs.mkdirSync(DEFAULT_CONFIG_DIR, { recursive: true });
  }

  const merged = { ...loadConfig(), ...config };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

export function getConfigPath() {
  return CONFIG_FILE;
}

export function getConfigDir() {
  return DEFAULT_CONFIG_DIR;
}
