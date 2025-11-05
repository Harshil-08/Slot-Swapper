import { useSocket } from '../../context/SocketContext';

export default function Notifications() {
  const { notifications, removeNotification } = useSocket();

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'swap-request':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'swap-accepted':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'swap-rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'swap-request':
        return '📬';
      case 'swap-accepted':
        return '✅';
      case 'swap-rejected':
        return '❌';
      default:
        return '🔔';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyle(
            notification.type
          )} border rounded-lg shadow-lg p-4 animate-slide-in`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
              <div>
                <p className="font-medium">{notification.message}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
