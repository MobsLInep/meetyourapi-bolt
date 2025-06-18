'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';

interface Message {
  role: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
}

interface ReportItem {
  _id: string;
  chatId: string;
  reason: string;
  createdAt: string;
  reportedBy: string;
  status: 'pending' | 'on_process' | 'resolved';
  chatHistory: Message[];
  description?: string;
}

async function getMyReportsDataClient(): Promise<ReportItem[]> {
  const res = await fetch('/api/my-reports', {
    cache: 'no-store',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('Failed to fetch your reports');
  }
  const data = await res.json();
  return data;
}

export default function MyReportsPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      redirect('/sign-in');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const initialReportsData = await getMyReportsDataClient();
        setReports(initialReportsData);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoaded, isSignedIn, user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_process':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading your reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Reported Chats</h1>
        
        {reports.length === 0 ? (
          <p className="text-gray-600">You haven't submitted any reports yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-gray-50 rounded-lg shadow-sm flex flex-col"
              >
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg truncate pr-2">Report #{report._id.slice(-6)}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(report.status)
                      }`}
                    >
                      {report.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1 line-clamp-2">Reason: {report.reason}</p>
                  <p className="text-xs text-gray-500 mb-1">
                    Description: {report.description?.slice(0, 100)}{report.description && report.description.length > 100 ? '...' : ''}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">
                    Reported by: {report.reportedBy}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(report.createdAt))} ago
                  </p>
                </div>
                <div className="p-4 border-t bg-white flex flex-wrap gap-2 justify-end">
                  {/* No action buttons for normal users to change status or delete */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 