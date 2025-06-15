import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { title, messages } = body;

    await connectDB();
    const chat = await Chat.create({
      userId,
      title,
      messages,
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 