import { useState } from 'react';
import axios from 'axios';

export default function SwapModal({ theirSlot, mySlots, onClose, onSuccess }) {
  const [selectedMySlot, setSelectedMySlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMySlot) {
      setError('Please select one of your slots');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await axios.post('http://localhost:3000/api/swap/request', {
        mySlotId: selectedMySlot,
        theirSlotId: theirSlot._id,
      });

      alert('Swap request sent successfully!');
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send swap request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h3 className="text-2xl font-bold mb-6">Request Slot Swap</h3>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-2">Their Slot:</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900">{theirSlot.title}</h5>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(theirSlot.startTime)} - {formatDate(theirSlot.endTime)}
            </p>
            <p className="text-sm text-gray-600">Owner: {theirSlot.owner.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-2">
              Select Your Slot to Offer:
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {mySlots.map((slot) => (
                <label
                  key={slot._id}
                  className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedMySlot === slot._id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="mySlot"
                    value={slot._id}
                    checked={selectedMySlot === slot._id}
                    onChange={(e) => setSelectedMySlot(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{slot.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(slot.startTime)} - {formatDate(slot.endTime)}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedMySlot}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Swap Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
