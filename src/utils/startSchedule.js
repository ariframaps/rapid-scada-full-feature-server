const cron = require("node-cron");
const db = require("../config/db");

async function startSchedules() {
  const [schedules] = await db.query("SELECT * FROM schedules");
  console.log("starting all the schedules");

  console.log(schedules);
  if (schedules && schedules.length > 0) {
    schedules.forEach((schedule) => {
      console.log(schedule);
      const [hour, minute] = schedule.scheduled_time.split(":");
      const cronTime = `${+minute} ${+hour} * * *`;

      cron.schedule(cronTime, () => {
        const percentage = schedule.action === "open" ? 100 : 0;
        sendCommand(schedule.gate_id, percentage);
      });
    });
  } else {
    console.log("there is no schedule");
  }
}

// Call this when your app starts
module.exports = { startSchedules };
