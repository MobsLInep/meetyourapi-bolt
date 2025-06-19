import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { X, AlertTriangle } from 'lucide-react';

interface ReportPopupProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
}

const REPORT_OPTIONS = [
  "Bot isn't clearing API query",
  "Bot uses vulgar content",
  "Bot provides incorrect information",
  "Bot is not responding",
  "Other issues"
];

export default function ReportPopup({ isOpen, onClose, chatId }: ReportPopupProps) {
  const [selectedOption, setSelectedOption] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!selectedOption) {
      setError('Please select a reason for reporting.');
      setIsSubmitting(false);
      return;
    }
    if (description.trim().split(/\s+/).length < 5) {
      setError('Description must be at least 5 words.');
      setIsSubmitting(false);
      return;
    }
    if (description.length > 2000) {
      setError('Description must be at most 2000 characters.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          chatId,
          reason: selectedOption,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      // Reset form
      setSelectedOption('');
      setDescription('');
      alert('Report submitted successfully!');
      onClose();
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-mono font-bold text-white">Report Chat</h2>
              <p className="text-sm text-slate-400 font-mono">Help us improve our service</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-mono font-semibold text-slate-300 mb-2">
              Reason for Report
            </label>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
              required
            >
              <option value="">Select a reason</option>
              {REPORT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-mono font-semibold text-slate-300 mb-2">
              Description
              <span className="text-slate-500 font-normal ml-2">
                (at least 5 words, max 2000 characters)
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white font-mono min-h-[100px] focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 resize-none"
              maxLength={2000}
              placeholder="Please describe the issue in detail..."
              required
            />
            <div className="text-xs text-slate-500 font-mono mt-1 text-right">
              {description.length} / 2000 characters
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm font-mono">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors font-mono"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-300 font-mono font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}