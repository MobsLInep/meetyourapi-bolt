'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Plus, LogOut } from 'lucide-react';
import Link from 'next/link';

interface Chat {
  _id: string;
  title: string;
  createdAt: string;
}

export default function Sidebar() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

  // Listen for chat updates
  useEffect(() => {
    const handleChatUpdate = () => {
      fetchChats();
    };

    window.addEventListener('chatUpdated', handleChatUpdate);
    return () => window.removeEventListener('chatUpdated', handleChatUpdate);
  }, []);

  const handleNewChat = () => {
    // Clear the current chat by navigating to dashboard without chat parameter
    router.push('/dashboard');
    // Dispatch event to notify ChatInterface to clear messages
    window.dispatchEvent(new Event('newChat'));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="w-64 h-screen bg-gray-100 p-4 flex flex-col">
      <div className="flex-1">
        <button
          onClick={handleNewChat}
          className="w-full bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>
        <div className="mt-4 space-y-2">
          {chats.map((chat) => (
            <Link
              key={chat._id}
              href={`/dashboard?chat=${chat._id}`}
              className="block p-2 hover:bg-gray-200 rounded-lg"
            >
              {chat.title}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>
    </div>
  );
} 