'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import ReportDetailModal from '@/components/ReportDetailModal';
import { useState, useEffect, useCallback } from 'react';

// NOTE: Direct database imports are NOT allowed in Client Components.
// Data fetching functions will use API routes instead.

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
  description: string;
  createdAt: string;
  reportedBy: string;
  status: 'pending' | 'on_process' | 'resolved';
  messages: Message[];
  chatHistory: Message[];
}

// Helper function for consistent report sorting
const sortReports = (reports: ReportItem[]) => {
  return [...reports].sort((a, b) => {
    // Resolved items always go to the end
    if (a.status === 'resolved' && b.status !== 'resolved') {
      return 1;
    }
    if (a.status !== 'resolved' && b.status === 'resolved') {
      return -1;
    }
    return 0; // Maintain existing relative order for same status
  });
};

// This function will now be called from the client-side, via fetch to an API route
async function getReportsDataClient(): Promise<ReportItem[]> {
  const res = await fetch('/api/reports', {
    cache: 'no-store',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('Failed to fetch reports');
  }
  const data = await res.json();
  return data;
}

// This function will now be called from the client-side, via fetch to an API route
async function getTotalUsersClient(): Promise<number> {
  const res = await fetch('/api/users/count', {
    cache: 'no-store',
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error('Failed to fetch total users');
  }
  const data = await res.json();
  return data.totalUsers;
}

export default function AdminPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const fetchedReports = await getReportsDataClient();
      const sortedReports = sortReports(fetchedReports);
      setReports(sortedReports);
      
      if (selectedReport) {
        const updatedSelectedReport = sortedReports.find(r => r._id === selectedReport._id);
        if (updatedSelectedReport) {
          setSelectedReport(updatedSelectedReport);
        }
      }
    } catch (err: any) {
      // Error handling is managed by fetchData or higher-level error boundaries
    }
  }, [selectedReport]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || user?.id !== process.env.NEXT_PUBLIC_ADMIN_USER_IDS) {
      redirect('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [usersCount, initialReportsData] = await Promise.all([
          getTotalUsersClient(),
          getReportsDataClient(),
        ]);
        setTotalUsers(usersCount);
        const sortedInitialReportsData = sortReports(initialReportsData);
        setReports(sortedInitialReportsData);
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isLoaded, isSignedIn, user]);

  const handleOpenModal = (report: ReportItem) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const handleStatusChange = async (reportId: string, newStatus: 'pending' | 'on_process' | 'resolved') => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error('Failed to update report status');
      }

      // Optimistic update and re-sort
      setReports(prevReports => {
        const updatedReports = prevReports.map(report => 
          report._id === reportId 
            ? { ...report, status: newStatus }
            : report
        );
        return sortReports(updatedReports);
      });

      if (selectedReport?._id === reportId) {
        setSelectedReport(prev => prev ? { ...prev, status: newStatus } : null);
      }

    } catch (error) {
      alert('Failed to update report status.');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error('Failed to delete report');
      }

      setReports(prevReports => prevReports.filter(report => report._id !== reportId));
      if (selectedReport?._id === reportId) {
        handleCloseModal();
      }

    } catch (error) {
      alert('Failed to delete report.');
    }
  };

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
        <p className="text-gray-600">Loading admin dashboard...</p>
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
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 mb-1">Total Registered Users</p>
              <p className="text-2xl font-bold text-blue-700">{totalUsers}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Report Statistics</h2>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 mb-1">Total Reports</p>
              <p className="text-2xl font-bold text-red-700">{reports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold p-4 border-b -mx-6 -mt-6 mb-6">Reported Chats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-gray-50 rounded-lg shadow-sm hover:shadow-md cursor-pointer flex flex-col transition-all duration-300 ease-in-out"
              >
                <div onClick={() => handleOpenModal(report)} className="p-4 flex-1">
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
                  <button
                    onClick={() => handleStatusChange(report._id, 'pending')}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                      report.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusChange(report._id, 'on_process')}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                      report.status === 'on_process' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    On Process
                  </button>
                  <button
                    onClick={() => handleStatusChange(report._id, 'resolved')}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                      report.status === 'resolved' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    Resolved
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report._id)}
                    className="px-3 py-1 bg-gray-100 text-red-600 rounded-md text-xs font-medium hover:bg-red-50 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ReportDetailModal
        report={selectedReport as any}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onReportUpdated={fetchReports}
      />
    </div>
  );
} 