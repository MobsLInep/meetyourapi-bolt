const cron = require('node-cron');
const { exec } = require('child_process');

console.log('Pending report reminder cron started. Will run every 3 hours.');

cron.schedule('0 */3 * * *', () => {
  console.log('Running pending report reminder script...');
  exec('npx tsx scripts/remind-pending-reports.ts', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running reminder script: ${error}`);
      return;
    }
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
  });
});

// Keep the process alive
setInterval(() => {}, 1 << 30); 