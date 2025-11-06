import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedToken = localStorage.getItem('token');
		const storedUser = localStorage.getItem('user');

		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(JSON.parse(storedUser));
			axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
		}
		setLoading(false);
	}, []);

	const signup = async (name, email, password) => {
		try {
			const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
				name,
				email,
				password,
			},{withCredentials:true});
			return response.data;
		} catch (error) {
			throw error.response?.data?.message || 'Signup failed';
		}
	};

	const login = async (email, password) => {
		try {
			const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
				email,
				password,
			},
				{withCredentials: true}
			);
			const { token: newToken, user: newUser } = response.data;

			setToken(newToken);
			setUser(newUser);

			localStorage.setItem('token', newToken);
			localStorage.setItem('user', JSON.stringify(newUser));

			axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

			return response.data;
		} catch (error) {
			throw error.response?.data?.message || 'Login failed';
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		delete axios.defaults.headers.common['Authorization'];
	};

	const value = {
		user,
		token,
		signup,
		login,
		logout,
		loading,
	};

	return ( 
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};
