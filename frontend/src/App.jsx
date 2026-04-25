import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfileSettings from './pages/ProfileSettings';
import GroupCreate from './pages/GroupCreate';
import { getChatsAPI } from './services/api';
import { connectSocket, disconnectSocket, getSocket } from './services/socket';

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Connect socket & listen for online users
  useEffect(() => {
    if (!currentUser) return;

    const userId = currentUser.id || currentUser._id;
    const socket = connectSocket(userId);

    socket.on('getOnlineUsers', (userIds) => {
      setOnlineUsers(userIds);
    });

    socket.on('updateChat', () => {
      fetchChats();
    });

    return () => {
      socket.off('getOnlineUsers');
      socket.off('updateChat');
    };

  }, [currentUser]);

  // Disconnect socket on logout
  const fetchChats = async () => {
    if (!currentUser) return;
    try {
      const { data } = await getChatsAPI();
      setChats(data);
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [currentUser]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleSetCurrentUser = (user) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      disconnectSocket();
      setOnlineUsers([]);
      setChats([]);
      setSelectedChat(null);
    }
  };

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) return <Navigate to="/login" />;
    return children;
  };

  return (
    <Router>
      <div className={isDarkMode ? 'dark' : ''}>
        <Routes>
          <Route path="/login" element={<Login setCurrentUser={handleSetCurrentUser} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard
                  currentUser={currentUser}
                  chats={chats}
                  setChats={setChats}
                  selectedChat={selectedChat}
                  setSelectedChat={setSelectedChat}
                  onlineUsers={onlineUsers}
                  toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                  isDarkMode={isDarkMode}
                  fetchChats={fetchChats}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSettings currentUser={currentUser} setCurrentUser={handleSetCurrentUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group/create"
            element={
              <ProtectedRoute>
                <GroupCreate />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
