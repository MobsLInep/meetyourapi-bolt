'use client';

import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Clock, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
}

interface Report {
  _id: string;
  chatId: string;
  reason: string;
  description: string;
  createdAt: string;
  reportedBy: string;
  status: 'pending' | 'resolved' | 'rejected' | undefined | null;
  messages: Message[];
}

interface ReportDetailModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onReportUpdated: () => void;
}

export default function ReportDetailModal({
  report,
  isOpen,
  onClose,
  onReportUpdated,
}: ReportDetailModalProps) {
  const [currentStatus, setCurrentStatus] = useState(report?.status || 'pending');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (report) {
      setCurrentStatus(report.status || 'pending');
    }
  }, [report]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleStatusChange = async (newStatus: 'pending' | 'resolved' | 'rejected') => {
    if (!report) return;
    
    setCurrentStatus(newStatus);
    
    try {
      const res = await fetch(`/api/reports/${report._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update report status');
      }
      
      onReportUpdated();
    } catch (error) {
      console.error('Error updating report status:', error);
      alert('Failed to update report status.');
      setCurrentStatus(report.status || 'pending');
    }
  };

  const handleDeleteReport = async () => {
    if (!report) return;
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }
    try {
      const res = await fetch(`/api/reports/${report._id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete report');
      }
      onReportUpdated();
      onClose();
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report.');
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string | null | undefined) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (!isOpen || !report) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-800 border-l border-slate-700/50 shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center pb-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-mono font-bold text-white">Report Details</h2>
                <p className="text-slate-400 font-mono text-sm">Investigation and resolution</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            {/* Report Info */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-mono font-bold text-cyan-400 text-lg">
                    Report #{report._id.slice(-8)}
                  </h3>
                  <p className="text-slate-400 font-mono text-sm mt-1">
                    Submitted {formatDistanceToNow(new Date(report.createdAt))} ago
                  </p>
                </div>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono font-semibold border ${
                    getStatusColor(currentStatus)
                  }`}
                >
                  {getStatusIcon(currentStatus)}
                  {(currentStatus || 'pending').replace(/_/g, ' ').toUpperCase()}
                </div>
              </div>
              <p className="text-slate-300 font-mono text-sm">
                <span className="text-slate-500">Reported by:</span> {report.reportedBy}
              </p>
            </div>

            {/* Report Details */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <h4 className="font-mono font-semibold text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Report Reason
              </h4>
              <p className="text-red-300 font-mono bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {report.reason}
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 className="font-mono font-semibold text-slate-300 mb-3">Description</h4>
              <p className="text-slate-400 font-mono whitespace-pre-line bg-slate-900/50 p-4 rounded-lg border border-slate-700/30">
                {report.description}
              </p>
            </div>

            {/* Chat History */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 className="font-mono font-semibold text-slate-300 mb-4">Chat History</h4>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {report.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      message.role === 'user' 
                        ? 'bg-blue-500/10 border-blue-500/20' 
                        : 'bg-slate-900/50 border-slate-700/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono font-semibold text-sm">
                        {message.role === 'user' ? (
                          <span className="text-blue-400">User</span>
                        ) : (
                          <span className="text-green-400">Assistant</span>
                        )}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {formatDistanceToNow(new Date(message.timestamp))} ago
                      </span>
                    </div>
                    {message.imageUrl && (
                      <img
                        src={message.imageUrl}
                        alt="Chat image"
                        className="max-w-full h-auto rounded-lg mb-2 border border-slate-600/50"
                      />
                    )}
                    <div className="text-slate-300 font-mono text-sm">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-slate-700/50 flex flex-wrap gap-3">
            <button
              onClick={() => handleStatusChange('pending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-semibold transition-all ${
                currentStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
              }`}
            >
              <Clock size={16} />
              Pending
            </button>
            <button
              onClick={() => handleStatusChange('resolved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-semibold transition-all ${
                currentStatus === 'resolved'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
              }`}
            >
              <CheckCircle size={16} />
              Resolved
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-mono font-semibold transition-all ${
                currentStatus === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
              }`}
            >
              <X size={16} />
              Rejected
            </button>
            <button
              onClick={handleDeleteReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-400 rounded-lg hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-sm font-mono font-semibold transition-all border border-slate-600/50"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}