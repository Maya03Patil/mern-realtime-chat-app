import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import EmptyState from '../components/EmptyState';

export default function Dashboard({
  currentUser,
  chats,
  setChats,
  selectedChat,
  setSelectedChat,
  onlineUsers,
  toggleDarkMode,
  isDarkMode,
  fetchChats,
}) {
  const activeChatData = chats.find(c => c._id === selectedChat);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-main)]">
      {/* Sidebar */}
      <div className={`
        ${selectedChat ? 'hidden md:block' : 'block'}
        w-full md:w-[380px] lg:w-[420px] flex-shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-surface)] absolute md:relative h-full z-20
      `}>
        <Sidebar
          currentUser={currentUser}
          chats={chats}
          setChats={setChats}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          onlineUsers={onlineUsers}
          toggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
          fetchChats={fetchChats}
        />
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col h-full bg-[#EFEAE2] dark:bg-[#0b141a] relative ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg")', backgroundSize: 'cover' }}>
        </div>

        {selectedChat ? (
          <ChatArea
            chat={activeChatData}
            currentUser={currentUser}
            onlineUsers={onlineUsers}
            onBack={() => setSelectedChat(null)}
            fetchChats={fetchChats}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
