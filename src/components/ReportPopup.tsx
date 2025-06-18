import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

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
  const { user } = useUser();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedOption) {
      setError('Please select a reason for reporting.');
      return;
    }
    if (description.trim().split(/\s+/).length < 5) {
      setError('Description must be at least 5 words.');
      return;
    }
    if (description.length > 2000) {
      setError('Description must be at most 2000 characters.');
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

      alert('Report submitted successfully!');
      onClose();
    } catch (err) {
      console.error('Error submitting report:', err);
      alert('Failed to submit report. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Report Chat</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Report
            </label>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="w-full p-2 border rounded-md"
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-400">(at least 5 words, max 2000 characters)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md min-h-[80px]"
              maxLength={2000}
              required
            />
            <div className="text-xs text-gray-500 mt-1">{description.length} / 2000 characters</div>
          </div>
          {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 