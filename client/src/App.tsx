import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';
import { CallProvider } from './context/CallContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import './index.css';

type Page = 'landing' | 'login' | 'register';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('landing');

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#000]">
        <svg
          className="w-8 h-8"
          style={{ animation: 'spin 0.8s linear infinite' }}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-10" cx="12" cy="12" r="10" stroke="white" strokeWidth="3" />
          <path fill="white" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  if (user) {
    return (
      <SocketProvider>
        <ChatProvider>
          <CallProvider>
            <Chat />
          </CallProvider>
        </ChatProvider>
      </SocketProvider>
    );
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (t.tagName === 'A') {
      e.preventDefault();
      const href = (t as HTMLAnchorElement).getAttribute('href');
      if (href === '/register') setPage('register');
      if (href === '/login') setPage('login');
    }
  };

  if (page === 'landing') {
    return <Landing onGetStarted={() => setPage('register')} onSignIn={() => setPage('login')} />;
  }

  return (
    <div onClick={handleLinkClick}>
      {page === 'login' ? <Login /> : <Register />}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
