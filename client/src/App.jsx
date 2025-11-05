import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import Navbar from './components/Navbar';

function AppContent() {
  const { user } = useAuth();
  const [view, setView] = useState('login');

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {view === 'login' ? (
          <Login onSwitchToSignup={() => setView('signup')} />
        ) : (
          <Signup onSwitchToLogin={() => setView('login')} />
        )}
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Dashboard />
      </div>
    </SocketProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
