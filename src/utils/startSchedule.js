const cron = require("node-cron");

async function startSchedules() {
  const schedules = await db.query("SELECT * FROM schedules");
  console.log("starting all the schedules");

  schedules.forEach((schedule) => {
    const [hour, minute] = schedule.scheduled_time.split(":");
    const cronTime = `${+minute} ${+hour} * * *`;

    cron.schedule(cronTime, () => {
      const percentage = schedule.action === "open" ? 100 : 0;
      sendCommand(schedule.gate_id, percentage);
    });
  });
}

// Call this when your app starts
module.exports = { startSchedules };
