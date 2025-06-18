import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';
import Chat from '@/models/Chat';
import { sendAdminReportEmail } from '@/lib/resend';

export async function GET() {
  try {
    const { userId } = auth();

    // Check if user is admin
    if (userId !== process.env.ADMIN_USER_IDS) {
      console.log('Unauthorized access attempt:', { userId, adminId: process.env.ADMIN_USER_IDS });
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');

    // Get all reports
    console.log('Fetching reports...');
    const reports = await Report.find().sort({ createdAt: -1 });
    console.log(`Found ${reports.length} reports`);

    // Return reports with their stored messages
    const reportsWithMessages = reports.map(report => ({
      _id: report._id,
      chatId: report.chatId,
      reason: report.reason,
      description: report.description,
      createdAt: report.createdAt,
      reportedBy: report.reportedBy,
      status: report.status || 'pending',
      messages: report.messages || [], // Use the stored messages from the report
    }));

    console.log('Successfully fetched all reports with stored messages');
    return NextResponse.json(reportsWithMessages);
  } catch (error: unknown) {
    console.error('Error in reports API:', error instanceof Error ? error.message : String(error));
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { chatId, reason, description } = await req.json();
    if (!chatId || !reason || !description) {
      return new NextResponse('Missing required fields', { status: 400 });
    }
    if (description.trim().split(/\s+/).length < 5 || description.length > 2000) {
      return new NextResponse('Description must be at least 5 words and at most 2000 characters.', { status: 400 });
    }

    await connectDB();

    // Fetch the chat to get its messages
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return new NextResponse('Chat not found', { status: 404 });
    }

    // Get user details from Clerk
    const user = await clerkClient.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!userEmail) {
      return new NextResponse('User email not found', { status: 400 });
    }

    // Create a deep copy of the messages array to store in the report
    const messagesSnapshot = JSON.parse(JSON.stringify(chat.messages));

    // Create report with the message snapshot
    const report = await Report.create({
      chatId,
      reportedBy: userEmail,
      reason,
      description,
      messages: messagesSnapshot, // Store the snapshot of messages
    });

    // Send email to admin (corporate style)
    await sendAdminReportEmail({
      subject: 'Notification: New User Report Submitted',
      text: `Dear Administrator,\n\nA new user report has been submitted to the Corporate Compliance Team.\n\nReport Details:\n- Reported By: ${userEmail}\n- Reason: ${reason}\n- Description: ${description}\n- Chat ID: ${chatId}\n- Status: Pending\n\nThis is an automated notification from the Compliance Monitoring System. Please do not reply to this email.\n\nBest regards,\nCorporate Compliance Monitoring System\nno-reply@yourcompany.com`,
      html: `<div style='font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f9f9f9;border-radius:8px;'><h2 style='color:#003366;'>Corporate Compliance Monitoring System</h2><p>Dear Administrator,</p><p>A new user report has been submitted to the <b>Corporate Compliance Team</b>.</p><h3 style='color:#003366;'>Report Details:</h3><ul><li><b>Reported By:</b> ${userEmail}</li><li><b>Reason:</b> ${reason}</li><li><b>Description:</b> ${description}</li><li><b>Chat ID:</b> ${chatId}</li><li><b>Status:</b> Pending</li></ul><p style='color:#888;'>This is an automated notification from the Compliance Monitoring System. Please do not reply to this email.</p><p style='color:#003366;font-weight:bold;'>Best regards,<br/>Corporate Compliance Monitoring System<br/>no-reply@yourcompany.com</p></div>`
    });

    return NextResponse.json(report);
  } catch (error: unknown) {
    console.error('Error creating report:', error instanceof Error ? error.message : String(error));
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 