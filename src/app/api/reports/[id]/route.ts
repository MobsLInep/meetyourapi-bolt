import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import connectDB from '@/lib/mongodb';
import Report from '@/models/Report';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    if (userId !== process.env.ADMIN_USER_IDS) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    const { id } = params;
    const { status } = await req.json();

    if (!status) {
      return new NextResponse('Status is required', { status: 400 });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true, lean: true }
    );

    if (!updatedReport) {
      return new NextResponse('Report not found', { status: 404 });
    }

    // Fetch the report again to ensure we get the latest state from the database
    const latestReport = await Report.findById(id).lean();
    if (!latestReport) {
      return new NextResponse('Report not found after update', { status: 404 });
    }
    
    return NextResponse.json(latestReport);
  } catch (error) {
    console.error('Error updating report:', error instanceof Error ? error.message : String(error));
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    if (userId !== process.env.ADMIN_USER_IDS) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    const { id } = params;

    const deletedReport = await Report.findByIdAndDelete(id);

    if (!deletedReport) {
      return new NextResponse('Report not found', { status: 404 });
    }

    return new NextResponse('Report deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error deleting report:', error instanceof Error ? error.message : String(error));
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 