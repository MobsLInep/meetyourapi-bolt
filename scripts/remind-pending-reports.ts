import connectDB from '../src/lib/mongodb';
import Report from '../src/models/Report';
import { sendAdminReportEmail } from '../src/lib/resend';

async function remindPendingReports() {
  await connectDB();
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const pendingReports = await Report.find({ status: 'pending', createdAt: { $lte: threeHoursAgo } });

  for (const report of pendingReports) {
    await sendAdminReportEmail({
      subject: 'Reminder: Pending Report',
      text: `Report ID: ${report._id}\nReported By: ${report.reportedBy}\nReason: ${report.reason}\nStatus: pending\nCreated At: ${report.createdAt}`,
      html: `<p>Reminder: A report is still pending.</p><ul><li><b>Report ID:</b> ${report._id}</li><li><b>Reported By:</b> ${report.reportedBy}</li><li><b>Reason:</b> ${report.reason}</li><li><b>Status:</b> pending</li><li><b>Created At:</b> ${report.createdAt}</li></ul>`
    });
  }
}

remindPendingReports().then(() => {
  console.log('Pending report reminders sent.');
  process.exit(0);
}).catch((err) => {
  console.error('Error sending pending report reminders:', err);
  process.exit(1);
}); 