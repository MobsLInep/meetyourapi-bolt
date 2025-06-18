'use client';

import { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Clock, Trash2 } from 'lucide-react';
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
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !report) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-lg transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-2xl font-bold">Report Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">Report #{report._id}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getStatusColor(currentStatus)
                  }`}
                >
                  {(currentStatus || 'pending').replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                Reported {formatDistanceToNow(new Date(report.createdAt))} ago
              </p>
              <p className="text-sm text-gray-500">
                Reported by: {report.reportedBy}
              </p>
            </div>

            <div className="mb-6 p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium mb-2 text-red-700">Report Reason:</h4>
              <p className="text-red-800">{report.reason}</p>
            </div>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2 text-gray-900">Description:</h4>
              <p className="text-gray-800 whitespace-pre-line break-words">{report.description}</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Chat History:</h4>
              {report.messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">
                      {message.role === 'user' ? 'User' : 'Assistant'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.timestamp))} ago
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t flex flex-col sm:flex-row justify-end gap-2">
            <button
              onClick={() => handleStatusChange('pending')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium ${
                currentStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
            >
              <Clock size={16} className="inline-block mr-2" />
              Mark Pending
            </button>
            <button
              onClick={() => handleStatusChange('resolved')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium ${
                currentStatus === 'resolved'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              <CheckCircle size={16} className="inline-block mr-2" />
              Mark Resolved
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium ${
                currentStatus === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
            >
              <CheckCircle size={16} className="inline-block mr-2" />
              Mark Rejected
            </button>
            <button
              onClick={handleDeleteReport}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 text-sm font-medium"
            >
              <Trash2 size={16} className="inline-block mr-2" />
              Delete Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 