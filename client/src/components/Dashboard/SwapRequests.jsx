import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';

export default function SwapRequests() {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/swap/my-requests`);
      setIncoming(response.data.incoming);
      setOutgoing(response.data.outgoing);
    } catch (err) {
      setError('Failed to load swap requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, accept) => {
    try {
      await axios.post(`${API_BASE_URL}/api/swap/response/${requestId}`, {
        accept,
      });
      alert(accept ? 'Swap accepted!' : 'Swap rejected');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to respond to swap request');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return styles[status] || styles.PENDING;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Swap Requests</h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Incoming Requests */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Incoming Requests ({incoming.length})
        </h3>

        {incoming.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No incoming swap requests
          </div>
        ) : (
          <div className="space-y-4">
            {incoming.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">{request.requester.name}</span> wants
                      to swap with you
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-blue-600 mb-2">
                      They Offer:
                    </p>
                    <h4 className="font-semibold text-gray-900">
                      {request.mySlot.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(request.mySlot.startTime)} -{' '}
                      {formatDate(request.mySlot.endTime)}
                    </p>
                  </div>

                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-green-600 mb-2">
                      For Your Slot:
                    </p>
                    <h4 className="font-semibold text-gray-900">
                      {request.theirSlot.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(request.theirSlot.startTime)} -{' '}
                      {formatDate(request.theirSlot.endTime)}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleRespond(request._id, true)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(request._id, false)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Requests */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Outgoing Requests ({outgoing.length})
        </h3>

        {outgoing.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No outgoing swap requests
          </div>
        ) : (
          <div className="space-y-4">
            {outgoing.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Request to <span className="font-medium">{request.responder.name}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-blue-600 mb-2">
                      You Offered:
                    </p>
                    <h4 className="font-semibold text-gray-900">
                      {request.mySlot.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(request.mySlot.startTime)} -{' '}
                      {formatDate(request.mySlot.endTime)}
                    </p>
                  </div>

                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <p className="text-xs font-medium text-green-600 mb-2">
                      For Their Slot:
                    </p>
                    <h4 className="font-semibold text-gray-900">
                      {request.theirSlot.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(request.theirSlot.startTime)} -{' '}
                      {formatDate(request.theirSlot.endTime)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
