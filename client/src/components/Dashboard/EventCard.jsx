export default function EventCard({ event, onEdit, onDelete, onToggleStatus, isOwner = false }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'BUSY':
        return 'bg-gray-100 text-gray-800';
      case 'SWAPPABLE':
        return 'bg-green-100 text-green-800';
      case 'SWAP_PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'BUSY':
        return '🔒';
      case 'SWAPPABLE':
        return '🔄';
      case 'SWAP_PENDING':
        return '⏳';
      default:
        return '📅';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            event.status
          )}`}
        >
          {getStatusIcon(event.status)} {event.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{formatDate(event.startTime)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{formatDate(event.endTime)}</span>
        </div>
        {event.owner && !isOwner && (
          <div className="flex items-center text-sm text-gray-600">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>{event.owner.name}</span>
          </div>
        )}
      </div>

      {isOwner && (
        <div className="flex space-x-2">
          {event.status !== 'SWAP_PENDING' && (
            <>
              <button
                onClick={() => onToggleStatus(event._id, event.status)}
                className="flex-1 px-3 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {event.status === 'BUSY' ? 'Make Swappable' : 'Make Busy'}
              </button>
              <button
                onClick={() => onEdit(event)}
                className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(event._id)}
                className="px-3 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50"
              >
                Delete
              </button>
            </>
          )}
          {event.status === 'SWAP_PENDING' && (
            <p className="text-sm text-yellow-600 italic">
              Swap request pending...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
