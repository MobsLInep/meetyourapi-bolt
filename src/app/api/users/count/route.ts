import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs';

export async function GET() {
  try {
    const { userId } = auth();

    // Ensure only admin can access this endpoint
    if (userId !== process.env.ADMIN_USER_IDS) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const totalUsers = await clerkClient.users.getCount();
    return NextResponse.json({ totalUsers });
  } catch (error) {
    console.error('Error fetching total users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 