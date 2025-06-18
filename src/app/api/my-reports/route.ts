import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();

    const user = await clerkClient.users.getUser(userId);
    
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse('User email not found', { status: 400 });
    }

    const userEmail = user.emailAddresses[0].emailAddress;
    const reports = await Report.find({ reportedBy: userEmail }).sort({ createdAt: -1 });

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

    return NextResponse.json(reportsWithMessages);
  } catch (error: unknown) {
    console.error('Error fetching user reports:', error instanceof Error ? error.message : String(error));
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 