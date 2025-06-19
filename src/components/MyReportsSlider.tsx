'use client';

import { useState, useEffect } from 'react';
import { X, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

interface MyReportsSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

async function getMyReportsDataClient(): Promise<ReportItem[]> {
  const res = await fetch('/api/my-reports', {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch your reports');
  }
  const data = await res.json();
  return data;
}

export default function MyReportsSlider({ isOpen, onClose }: MyReportsSliderProps) {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

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
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? 'visible' : 'invisible'
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slider Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-800 border-l border-slate-700/50 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div>
              <h2 className="text-2xl font-mono font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                My Reports
              </h2>
              <p className="text-slate-400 text-sm font-mono mt-1">
                Track your submitted reports
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400 font-mono">Error: {error}</p>
                </div>
              </div>
            ) : reports.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-400 font-mono text-lg mb-2">No reports yet</p>
                  <p className="text-slate-500 text-sm">Your submitted reports will appear here</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report._id}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/70 transition-colors backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-mono font-semibold text-cyan-400 mb-1">
                          Report #{report._id.slice(-6)}
                        </h3>
                        <p className="text-slate-400 text-sm font-mono">
                          {formatDistanceToNow(new Date(report.createdAt))} ago
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${getStatusColor(
                          report.status
                        )}`}
                      >
                        {getStatusIcon(report.status)}
                        {report.status.replace('_', ' ').toUpperCase()}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-mono font-semibold text-slate-300 mb-1">
                          Reason:
                        </h4>
                        <p className="text-slate-400 text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-700/30">
                          {report.reason}
                        </p>
                      </div>

                      {report.description && (
                        <div>
                          <h4 className="text-sm font-mono font-semibold text-slate-300 mb-1">
                            Description:
                          </h4>
                          <p className="text-slate-400 text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-700/30 whitespace-pre-line">
                            {report.description.length > 200
                              ? `${report.description.slice(0, 200)}...`
                              : report.description}
                          </p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-mono font-semibold text-slate-300 mb-1">
                          Chat ID:
                        </h4>
                        <p className="text-slate-500 text-xs font-mono bg-slate-900/50 p-2 rounded border border-slate-700/30">
                          {report.chatId}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}