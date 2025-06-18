import { useState } from 'react';
import { format } from 'date-fns';

interface Message {
  role: string;
  content: string;
  timestamp: Date;
}

interface Report {
  _id: string;
  chatId: string;
  reportedBy: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ReportCardProps {
  report: Report;
  onStatusChange?: (reportId: string, newStatus: 'pending' | 'resolved' | 'rejected') => void;
  isAdmin?: boolean;
}

export default function ReportCard({ report, onStatusChange, isAdmin = false }: ReportCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Report #{report._id}</h3>
          <p className="text-sm text-gray-500">
            Reported by: {report.reportedBy}
          </p>
          <p className="text-sm text-gray-500">
            Reported on: {format(new Date(report.createdAt), 'PPpp')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
            {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </span>
          {isAdmin && onStatusChange && (
            <select
              value={report.status}
              onChange={(e) => onStatusChange(report._id, e.target.value as 'pending' | 'resolved' | 'rejected')}
              className="ml-2 p-1 border rounded text-sm"
            >
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Reason for Report:</h4>
        <p className="text-gray-700">{report.reason}</p>
        <h4 className="font-medium text-gray-900 mb-2 mt-4">Description:</h4>
        <p className="text-gray-700 whitespace-pre-line break-words">{report.description}</p>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isExpanded ? 'Hide Messages' : 'Show Messages'}
        </button>
        
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {report.messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  message.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">
                    {message.role === 'user' ? 'User' : 'Assistant'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(message.timestamp), 'PPpp')}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 