import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerStatsCommand } from './stats.js';
import * as statsModule from '../stats.js';
import * as configModule from '../config.js';

const fakeStats = {
  total: 3,
  tagged: 2,
  untagged: 1,
  topTags: [{ tag: 'dev', count: 2 }],
  avgTagsPerBookmark: 1.33,
  domains: { 'github.com': 2, 'example.com': 1 },
};

beforeEach(() => {
  vi.spyOn(configModule, 'loadConfig').mockResolvedValue({ storeDir: '/fake/store' });
  vi.spyOn(statsModule, 'getStats').mockResolvedValue(fakeStats);
});

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerStatsCommand(program);
  return program;
}

describe('stats command', () => {
  it('calls getStats with storeDir from config', async () => {
    const program = makeProgram();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['stats'], { from: 'user' });
    expect(statsModule.getStats).toHaveBeenCalledWith('/fake/store');
    spy.mockRestore();
  });

  it('prints human-readable output by default', async () => {
    const program = makeProgram();
    const lines = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => lines.push(args.join(' ')));
    await program.parseAsync(['stats'], { from: 'user' });
    const output = lines.join('\n');
    expect(output).toContain('Total bookmarks');
    expect(output).toContain('3');
    expect(output).toContain('#dev');
    expect(output).toContain('github.com');
  });

  it('outputs valid JSON when --json flag is passed', async () => {
    const program = makeProgram();
    let jsonOutput = '';
    vi.spyOn(console, 'log').mockImplementation((v) => { jsonOutput = v; });
    await program.parseAsync(['stats', '--json'], { from: 'user' });
    const parsed = JSON.parse(jsonOutput);
    expect(parsed.total).toBe(3);
    expect(parsed.topTags).toHaveLength(1);
  });
});
