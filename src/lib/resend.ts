import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAdminReportEmail({ subject, text, html }: { subject: string; text: string; html?: string }) {
  return resend.emails.send({
    from: 'MeetYourAPI-noreply@resend.dev',
    to: process.env.ADMIN_EMAIL!,
    subject,
    text,
    html,
  });
} 