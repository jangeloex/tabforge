import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerShareCommand } from './share.js';

vi.mock('../bookmarks.js', () => ({
  loadBookmarks: vi.fn(async () => [
    { url: 'https://alpha.dev', title: 'Alpha', tags: ['dev'] },
    { url: 'https://beta.io', title: 'Beta', tags: ['writing'] },
    { url: 'https://gamma.net', title: 'Gamma', tags: ['dev', 'tools'] },
  ]),
}));

vi.mock('../config.js', () => ({
  loadConfig: vi.fn(async () => ({})),
}));

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerShareCommand(program);
  return program;
}

describe('share text', () => {
  it('prints all bookmarks as plain text', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['share', 'text'], { from: 'user' });
    const out = spy.mock.calls.map(c => c[0]).join('\n');
    expect(out).toContain('Alpha');
    expect(out).toContain('https://alpha.dev');
    spy.mockRestore();
  });

  it('filters by tag', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['share', 'text', '--tags', 'writing'], { from: 'user' });
    const out = spy.mock.calls.map(c => c[0]).join('\n');
    expect(out).toContain('Beta');
    expect(out).not.toContain('Alpha');
    spy.mockRestore();
  });
});

describe('share markdown', () => {
  it('prints markdown links', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['share', 'markdown'], { from: 'user' });
    const out = spy.mock.calls.map(c => c[0]).join('\n');
    expect(out).toContain('[Alpha](https://alpha.dev)');
    spy.mockRestore();
  });
});

describe('share bundle', () => {
  it('prints valid JSON bundle', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['share', 'bundle'], { from: 'user' });
    const raw = spy.mock.calls[0][0];
    const bundle = JSON.parse(raw);
    expect(bundle.count).toBe(3);
    expect(bundle.markdown).toContain('[Alpha]');
    expect(bundle.html).toContain('<!DOCTYPE');
    expect(bundle.generatedAt).toBeTruthy();
    spy.mockRestore();
  });

  it('filters bundle by tag', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['share', 'bundle', '--tags', 'dev'], { from: 'user' });
    const bundle = JSON.parse(spy.mock.calls[0][0]);
    expect(bundle.count).toBe(2);
    spy.mockRestore();
  });
});
