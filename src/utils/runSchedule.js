const cron = require("node-cron");
const db = require("../config/db");
const scadaClient = require("./scadaClient");
let cronJobs = [];

async function stopAndRunAllSchedule() {
  console.log("refetch allschedule");
  try {
    // stop old jobs
    cronJobs.forEach((job) => job.stop());
    cronJobs = [];

    const [schedules] = await db.query("SELECT * FROM schedules");

    schedules.forEach((schedule) => {
      const [hour, minute] = schedule.scheduled_time.split(":");
      const cronTime = `${+minute} ${+hour} * * *`;

      const job = cron.schedule(cronTime, () => {
        scadaClient.sendCommand(schedule.cnl, schedule.value);
        console.log(`schedule triggered in: ${schedule.id}`);
      });

      cronJobs.push(job);
    });
  } catch (error) {
    throw new Error("failed to stop and run all schedule", error);
  }
}

module.exports = { stopAndRunAllSchedule };
