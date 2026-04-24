import { exportBookmarks } from '../export.js';

export async function handleExport(format, options) {
  const fmt = format || 'json';
  const outputPath = options?.output || null;

  try {
    const dest = await exportBookmarks(fmt, outputPath);
    console.log(`✓ Exported bookmarks as ${fmt.toUpperCase()} to: ${dest}`);
  } catch (err) {
    console.error(`✗ Export failed: ${err.message}`);
    process.exit(1);
  }
}

export function registerExportCommand(program) {
  program
    .command('export [format]')
    .description('Export bookmarks to a file. Formats: json (default), html')
    .option('-o, --output <path>', 'output file path')
    .action((format, options) => handleExport(format, options));
}
