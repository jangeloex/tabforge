import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { loadConfig } from './config.js';

export function getRepoPath() {
  const config = loadConfig();
  if (!config.repoPath) {
    throw new Error('No repo path configured. Run `tabforge init` first.');
  }
  return config.repoPath;
}

export function isGitRepo(dir) {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd: dir, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function gitPull(repoPath) {
  try {
    const output = execSync('git pull --rebase', { cwd: repoPath, encoding: 'utf8' });
    return { success: true, output: output.trim() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function gitPush(repoPath, message = 'sync: update bookmarks') {
  try {
    execSync('git add .', { cwd: repoPath, stdio: 'ignore' });
    const statusOutput = execSync('git status --porcelain', { cwd: repoPath, encoding: 'utf8' });
    if (!statusOutput.trim()) {
      return { success: true, output: 'Nothing to commit.' };
    }
    execSync(`git commit -m "${message}"`, { cwd: repoPath, stdio: 'ignore' });
    const pushOutput = execSync('git push', { cwd: repoPath, encoding: 'utf8' });
    return { success: true, output: pushOutput.trim() || 'Pushed successfully.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function syncBookmarks() {
  const repoPath = getRepoPath();

  if (!isGitRepo(repoPath)) {
    throw new Error(`Directory is not a git repo: ${repoPath}`);
  }

  const pullResult = gitPull(repoPath);
  if (!pullResult.success) {
    throw new Error(`Pull failed: ${pullResult.error}`);
  }

  const pushResult = gitPush(repoPath);
  if (!pushResult.success) {
    throw new Error(`Push failed: ${pushResult.error}`);
  }

  return { pull: pullResult.output, push: pushResult.output };
}
