import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { API_BASE_URL, SOCKET_URL } from '../config/api';

const SocketContext = createContext();

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (!context) {
		throw new Error('useSocket must be used within SocketProvider');
	}
	return context;
};

export const SocketProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const { token } = useAuth();

	const fetchNotifications = async () => {
		try {
			const response = await axios.get(`${API_BASE_URL}/api/swap/notifications`);
			const dbNotifications = response.data.notifications.map(n => ({
				id: n._id,
				type: n.type,
				message: n.message,
				data: n.data,
				timestamp: new Date(n.createdAt),
				read: n.read,
			}));
			setNotifications(dbNotifications);
			setUnreadCount(response.data.unreadCount);
		} catch (error) {
			console.error('Failed to fetch notifications:', error);
		}
	};

	const markAsRead = async (notificationId) => {
		try {
			await axios.patch(`${API_BASE_URL}/api/swap/notifications/${notificationId}/read`);
			setNotifications(prev => 
				prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
			);
			setUnreadCount(prev => Math.max(0, prev - 1));
		} catch (error) {
			console.error('Failed to mark notification as read:', error);
		}
	};

	const markAllAsRead = async () => {
		try {
			await axios.patch(`${API_BASE_URL}/api/swap/notifications/read-all`);
			setNotifications(prev => prev.map(n => ({ ...n, read: true })));
			setUnreadCount(0);
		} catch (error) {
			console.error('Failed to mark all notifications as read:', error);
		}
	};

	useEffect(() => {
		if (!token) return;

		fetchNotifications();

		const newSocket = io(SOCKET_URL, {
			auth: { token },
		});

		newSocket.on('connect', () => {
			console.log('✅ Socket connected');
		});

		newSocket.on('swap-request', (data) => {
			console.log('Swap request received:', data);
			const newNotification = {
				id: data.notificationId || Date.now(),
				type: 'swap-request',
				message: data.message,
				data: data.swapRequest,
				timestamp: new Date(),
				read: false,
			};
			setNotifications((prev) => [newNotification, ...prev]);
			setUnreadCount(prev => prev + 1);
		});

		newSocket.on('swap-accepted', (data) => {
			console.log('Swap request accepted:', data);
			const newNotification = {
				id: data.notificationId || Date.now(),
				type: 'swap-accepted',
				message: data.message,
				data: data.swapRequest,
				timestamp: new Date(),
				read: false,
			};
			setNotifications((prev) => [newNotification, ...prev]);
			setUnreadCount(prev => prev + 1);
		});

		newSocket.on('swap-rejected', (data) => {
			console.log('Swap request rejected:', data);
			const newNotification = {
				id: data.notificationId || Date.now(),
				type: 'swap-rejected',
				message: data.message,
				data: data.swapRequest,
				timestamp: new Date(),
				read: false,
			};
			setNotifications((prev) => [newNotification, ...prev]);
			setUnreadCount(prev => prev + 1);
		});

		newSocket.on('disconnect', () => {
			console.log('❌ Socket disconnected');
		});

		setSocket(newSocket);

		return () => {
			newSocket.close();
		};
	}, [token]);

	const clearNotifications = () => {
		setNotifications([]);
		setUnreadCount(0);
	};

	const removeNotification = (id) => {
		setNotifications((prev) => {
			const notification = prev.find(n => n.id === id);
			if (notification && !notification.read) {
				setUnreadCount(count => Math.max(0, count - 1));
			}
			return prev.filter(n => n.id !== id);
		});

		markAsRead(id);
	};

	const value = {
		socket,
		notifications,
		unreadCount,
		clearNotifications,
		removeNotification,
		markAsRead,
		markAllAsRead,
		fetchNotifications,
	};

	return (
		<SocketContext.Provider value={value}>
			{children}
		</SocketContext.Provider>
	);
};
