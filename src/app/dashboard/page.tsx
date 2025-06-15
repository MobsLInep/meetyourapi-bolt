import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { chat?: string };
}) {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ChatInterface chatId={searchParams.chat} />
      </main>
    </div>
  );
} 