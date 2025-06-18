'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Plus, LogOut, Trash2, Flag, Shield } from 'lucide-react';
import Link from 'next/link';
import ReportPopup from './ReportPopup';

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
  const [reportPopupOpen, setReportPopupOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const isAdmin = user?.id === process.env.NEXT_PUBLIC_ADMIN_USER_IDS;

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      const data = await response.json();
      setChats(data);
    } catch (error) {
      // console.error('Error fetching chats:', error);
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

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling

    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        const response = await fetch(`/api/chats/${chatId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Remove the chat from the local state
          setChats(chats.filter(chat => chat._id !== chatId));
          
          // If the deleted chat was the current one, redirect to dashboard
          const currentChatId = new URLSearchParams(window.location.search).get('chat');
          if (currentChatId === chatId) {
            router.push('/dashboard');
            window.dispatchEvent(new Event('newChat'));
          }
        }
      } catch (error) {
        // console.error('Error deleting chat:', error);
      }
    }
  };

  const handleReportClick = (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedChatId(chatId);
    setReportPopupOpen(true);
  };

  return (
    <div className="w-64 h-screen bg-gray-100 p-4 flex flex-col">
      <div className="flex-1">
        <button
          onClick={handleNewChat}
          className="w-full bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 mb-2"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>

        <Link
          href="/dashboard/my-reports"
          className="w-full bg-teal-500 text-white p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-teal-600 mb-2"
        >
          <Flag className="w-5 h-5" />
          View your reports
        </Link>

        {isAdmin && (
          <Link
            href="/admin"
            className="w-full bg-purple-500 text-white p-2 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-600 mb-4"
          >
            <Shield className="w-5 h-5" />
            Admin Page
          </Link>
        )}

        <div className="mt-4 space-y-2">
          {chats.map((chat) => (
            <Link
              key={chat._id}
              href={`/dashboard?chat=${chat._id}`}
              className="group block p-2 hover:bg-gray-200 rounded-lg relative"
            >
              <span className="pr-16">{chat.title}</span>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                <button
                  onClick={(e) => handleReportClick(chat._id, e)}
                  className="p-1 text-gray-500 hover:text-yellow-500"
                >
                  <Flag size={16} />
                </button>
                <button
                  onClick={(e) => handleDeleteChat(chat._id, e)}
                  className="p-1 text-gray-500 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
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

      <ReportPopup
        isOpen={reportPopupOpen}
        onClose={() => {
          setReportPopupOpen(false);
          setSelectedChatId(null);
        }}
        chatId={selectedChatId || ''}
      />
    </div>
  );
} 