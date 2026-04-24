import { createBackup, listBackups, restoreBackup, pruneBackups } from '../backup.js';

export function registerBackupCommand(program) {
  const cmd = program.command('backup').description('manage local bookmark backups');

  cmd
    .command('create')
    .description('create a backup of current bookmarks')
    .action(() => {
      try {
        const dest = createBackup();
        console.log(`Backup created: ${dest}`);
      } catch (err) {
        console.error(`Error creating backup: ${err.message}`);
        process.exit(1);
      }
    });

  cmd
    .command('list')
    .description('list available backups')
    .action(() => {
      const backups = listBackups();
      if (backups.length === 0) {
        console.log('No backups found.');
        return;
      }
      backups.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    });

  cmd
    .command('restore <filename>')
    .description('restore bookmarks from a backup file')
    .action((filename) => {
      try {
        const data = restoreBackup(filename);
        console.log(`Restored ${data.length} bookmark(s) from ${filename}`);
      } catch (err) {
        console.error(`Error restoring backup: ${err.message}`);
        process.exit(1);
      }
    });

  cmd
    .command('prune')
    .description('remove old backups, keeping the most recent ones')
    .option('-k, --keep <n>', 'number of backups to keep', '10')
    .action((opts) => {
      const keep = parseInt(opts.keep, 10);
      const deleted = pruneBackups(keep);
      if (deleted.length === 0) {
        console.log('Nothing to prune.');
      } else {
        console.log(`Pruned ${deleted.length} backup(s).`);
      }
    });
}
