import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import connectDB from '@/lib/mongodb';
import Chat from '@/models/Chat';

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    const chat = await Chat.findOne({ _id: params.chatId, userId });
    
    if (!chat) {
      return new NextResponse('Chat not found', { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { messages } = body;

    await connectDB();
    const chat = await Chat.findOneAndUpdate(
      { _id: params.chatId, userId },
      { messages, updatedAt: new Date() },
      { new: true }
    );

    if (!chat) {
      return new NextResponse('Chat not found', { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error updating chat:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await connectDB();
    const chat = await Chat.findOneAndDelete({ _id: params.chatId, userId });

    if (!chat) {
      return new NextResponse('Chat not found', { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 