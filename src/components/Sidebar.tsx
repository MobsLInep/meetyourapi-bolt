'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Plus, LogOut, Trash2, Flag, Shield, Code2, X } from 'lucide-react';
import Link from 'next/link';
import ReportPopup from './ReportPopup';
import MyReportsSlider from './MyReportsSlider';

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
  const [myReportsOpen, setMyReportsOpen] = useState(false);
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
    <>
      <div className="w-80 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 p-6 flex flex-col backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-700/50">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              MeetYourAPI
            </h1>
            <p className="text-xs text-slate-400 font-mono">Smart API Support</p>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleNewChat}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transform hover:-translate-y-0.5 transition-all duration-300 font-semibold"
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>

            <button
              onClick={() => setMyReportsOpen(true)}
              className="w-full bg-slate-800/50 border border-slate-600/50 text-slate-300 p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-700/50 hover:border-cyan-500/50 hover:text-cyan-400 transform hover:-translate-y-0.5 transition-all duration-300 font-semibold backdrop-blur-sm"
            >
              <Flag className="w-5 h-5" />
              My Reports
            </button>

            {isAdmin && (
              <Link
                href="/admin"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all duration-300 font-semibold"
              >
                <Shield className="w-5 h-5" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-sm font-mono font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              Recent Chats
            </h3>
            <div className="space-y-2">
              {chats.map((chat) => (
                <Link
                  key={chat._id}
                  href={`/dashboard?chat=${chat._id}`}
                  className="group block p-3 hover:bg-slate-800/50 rounded-lg relative border border-transparent hover:border-slate-600/50 transition-all duration-200"
                >
                  <div className="pr-16">
                    <p className="text-slate-300 font-medium truncate group-hover:text-cyan-400 transition-colors">
                      {chat.title}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <button
                      onClick={(e) => handleReportClick(chat._id, e)}
                      className="p-1.5 text-slate-500 hover:text-yellow-400 hover:bg-yellow-400/10 rounded transition-colors"
                      title="Report Chat"
                    >
                      <Flag size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteChat(chat._id, e)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                      title="Delete Chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Link>
              ))}
              {chats.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm font-mono">No chats yet</p>
                  <p className="text-slate-600 text-xs font-mono mt-1">Start a new conversation</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="pt-6 border-t border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user?.imageUrl}
              alt={user?.firstName || 'User'}
              className="w-10 h-10 rounded-full border-2 border-slate-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-slate-300 font-semibold truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-slate-500 text-xs font-mono truncate">
                {user?.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-all duration-200 font-mono text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Report Popup */}
      <ReportPopup
        isOpen={reportPopupOpen}
        onClose={() => {
          setReportPopupOpen(false);
          setSelectedChatId(null);
        }}
        chatId={selectedChatId || ''}
      />

      {/* My Reports Slider */}
      <MyReportsSlider
        isOpen={myReportsOpen}
        onClose={() => setMyReportsOpen(false)}
      />
    </>
  );
}