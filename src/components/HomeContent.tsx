'use client';

import { UserButton, useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomeContent() {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Debug output only on the client side
  useEffect(() => {
    console.log('Clerk useUser (client-side):', { user, isSignedIn });
  }, [user, isSignedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        {isSignedIn && user && (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <img
                src={user.imageUrl}
                alt={user.firstName || 'User'}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-500">{user.emailAddresses[0]?.emailAddress}</p>
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
        )}

        <h1 className="text-3xl font-bold text-center mb-8">Welcome to Gemini Chat</h1>
        <p className="text-gray-600 text-center mb-8">
          {isSignedIn 
            ? "You're signed in! Start chatting with AI."
            : "Experience the power of AI with image support and intelligent conversations."}
        </p>

        {isSignedIn ? (
          <Link
            href="/dashboard"
            className="block w-full bg-blue-500 text-white text-center py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="block w-full bg-blue-500 text-white text-center py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Get Started
          </Link>
        )}
      </div>
    </div>
  );
} 