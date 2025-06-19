'use client';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import ReportDetailModal from '@/components/ReportDetailModal';
import { useState, useEffect, useCallback } from 'react';
import { Shield, Users, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

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
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'on_process':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'on_process':
        return <TrendingUp className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const processingReports = reports.filter(r => r.status === 'on_process').length;
  const resolvedReports = reports.filter(r => r.status === 'resolved').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-mono">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 font-mono">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-mono font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 font-mono">System monitoring and report management</p>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-mono font-semibold text-slate-300">Total Users</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-blue-400">{totalUsers}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-mono font-semibold text-slate-300">Total Reports</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-red-400">{reports.length}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="font-mono font-semibold text-slate-300">Pending</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-yellow-400">{pendingReports}</p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-mono font-semibold text-slate-300">Resolved</h3>
            </div>
            <p className="text-3xl font-mono font-bold text-green-400">{resolvedReports}</p>
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm">
          <div className="p-6 border-b border-slate-700/50">
            <h2 className="text-2xl font-mono font-bold text-white">Reported Chats</h2>
            <p className="text-slate-400 font-mono mt-1">Manage and review user reports</p>
          </div>
          
          <div className="p-6">
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 font-mono text-lg">No reports found</p>
                <p className="text-slate-500 font-mono text-sm">All systems running smoothly</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className="bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-slate-600/50 cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1"
                  >
                    <div onClick={() => handleOpenModal(report)} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-mono font-semibold text-cyan-400 truncate pr-2">
                          Report #{report._id.slice(-6)}
                        </h3>
                        <div
                          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono font-semibold border ${
                            getStatusColor(report.status)
                          }`}
                        >
                          {getStatusIcon(report.status)}
                          {report.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-slate-300 font-mono">
                          <span className="text-slate-500">Reason:</span> {report.reason}
                        </p>
                        <p className="text-xs text-slate-400 font-mono line-clamp-2">
                          <span className="text-slate-500">Description:</span> {report.description?.slice(0, 100)}{report.description && report.description.length > 100 ? '...' : ''}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          <span className="text-slate-600">By:</span> {report.reportedBy}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          <span className="text-slate-600">Time:</span> {formatDistanceToNow(new Date(report.createdAt))} ago
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 border-t border-slate-700/50 bg-slate-900/30 flex flex-wrap gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(report._id, 'pending');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                          report.status === 'pending' 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(report._id, 'on_process');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                          report.status === 'on_process' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        }`}
                      >
                        Processing
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(report._id, 'resolved');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                          report.status === 'resolved' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        Resolved
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReport(report._id);
                        }}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs font-mono font-semibold hover:bg-red-500/30 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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