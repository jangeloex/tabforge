import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { saveConfig, loadConfig, getConfigDir } from './config.js';

export function initStore(options = {}) {
  const config = loadConfig();
  const storeDir = options.storeDir || config.storeDir;

  if (!fs.existsSync(storeDir)) {
    fs.mkdirSync(storeDir, { recursive: true });
    console.log(`Created store directory: ${storeDir}`);
  }

  const gitDir = path.join(storeDir, '.git');
  if (!fs.existsSync(gitDir)) {
    execSync('git init', { cwd: storeDir, stdio: 'pipe' });
    console.log('Initialized git repository in store.');
  } else {
    console.log('Git repository already initialized.');
  }

  const bookmarksFile = path.join(storeDir, 'bookmarks.json');
  if (!fs.existsSync(bookmarksFile)) {
    fs.writeFileSync(bookmarksFile, JSON.stringify({ bookmarks: [], version: 1 }, null, 2));
    execSync('git add bookmarks.json && git commit -m "init: create bookmarks store"', {
      cwd: storeDir,
      stdio: 'pipe',
    });
    console.log('Created initial bookmarks.json.');
  }

  const updatedConfig = saveConfig({
    storeDir,
    ...(options.gitRemote ? { gitRemote: options.gitRemote } : {}),
    ...(options.browser ? { browser: options.browser } : {}),
  });

  if (updatedConfig.gitRemote) {
    execSync(`git remote add origin ${updatedConfig.gitRemote}`, {
      cwd: storeDir,
      stdio: 'pipe',
    });
    console.log(`Set git remote: ${updatedConfig.gitRemote}`);
  }

  console.log(`tabforge initialized. Config at: ${getConfigDir()}`);
  return updatedConfig;
}
