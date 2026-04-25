import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, MessageSquarePlus, Sun, Moon, Users, LogOut, Trash2, ChevronDown, BellOff, Archive, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { createOrGetChatAPI, deleteChatAPI, toggleArchiveAPI, toggleMuteAPI } from '../services/api';
import { getSocket } from '../services/socket';
import NewChatModal from './NewChatModal';

const BASE_URL = 'http://localhost:4001';

export default function Sidebar({ currentUser, chats, setChats, selectedChat, setSelectedChat, onlineUsers, toggleDarkMode, isDarkMode, fetchChats }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeChatMenu, setActiveChatMenu] = useState(null); // Stores chatId
  const [showArchived, setShowArchived] = useState(false);
  const [typingChats, setTypingChats] = useState({}); // { chatId: true/false }
  const navigate = useNavigate();

  // Close menu when clicking anywhere else
  useEffect(() => {
    const closeMenu = () => setActiveChatMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleDeleteChat = async (e, chatItem) => {
    e.stopPropagation(); // Don't select the chat when clicking delete
    const chatId = chatItem._id;
    if (!window.confirm("Delete this chat and all messages? This cannot be undone.")) return;
    try {
      await deleteChatAPI(chatId);
      if (selectedChat === chatId) setSelectedChat(null);
      await fetchChats();

      const socket = getSocket();
      if (socket) {
        const participantIds = chatItem.participants.map(p => p._id || p);
        socket.emit('deleteChat', { chatId, participants: participantIds });
      }
    } catch (err) {
      console.error("Delete chat failed:", err);
    }
  };

  const handleToggleArchive = async (e, chatId) => {
    e.stopPropagation();
    try {
      await toggleArchiveAPI(chatId);
      await fetchChats();
      setActiveChatMenu(null);
    } catch (err) {
      console.error("Archive failed:", err);
    }
  };

  const handleToggleMute = async (e, chatId) => {
    e.stopPropagation();
    try {
      await toggleMuteAPI(chatId);
      await fetchChats();
      setActiveChatMenu(null);
    } catch (err) {
      console.error("Mute failed:", err);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('typing', ({ chatId }) => {
        setTypingChats(prev => ({ ...prev, [chatId]: true }));
      });
      socket.on('stopTyping', ({ chatId }) => {
        setTypingChats(prev => ({ ...prev, [chatId]: false }));
      });
      socket.on('chatDeleted', ({ chatId }) => {
        if (selectedChat === chatId) setSelectedChat(null);
        fetchChats();
      });
    }
    return () => {
      if (socket) {
        socket.off('typing');
        socket.off('stopTyping');
        socket.off('chatDeleted');
      }
    };
  }, [selectedChat, fetchChats]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.reload(); // Quickest way to clear state and redirect via ProtectedRoute
  };

  const getChatDisplay = (chat) => {
    if (chat.isGroup) {
      return { name: chat.groupName, avatar: chat.groupImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.groupName)}&background=128C7E&color=fff` };
    }
    const other = chat.participants?.find(p => p._id !== currentUser.id && p._id !== currentUser._id);
    return {
      name: other?.name || 'Unknown',
      avatar: other?.profilePic
        ? `${BASE_URL}/${other.profilePic}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=128C7E&color=fff`,
      userId: other?._id,
    };
  };

  const myId = currentUser?._id || currentUser?.id;
  const myIdStr = String(myId || "");

  const filteredChats = chats.filter(chat => {
    const { name } = getChatDisplay(chat);
    const isArchived = chat.archivedBy?.some(id => String(id) === myIdStr);
    
    if (showArchived) return isArchived && name.toLowerCase().includes(searchQuery.toLowerCase());
    return !isArchived && name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const archivedCount = chats.filter(c => c.archivedBy?.some(id => String(id) === myIdStr)).length;

  const handleStartNewChat = async (user) => {
    try {
      const { data } = await createOrGetChatAPI(user._id);
      await fetchChats();
      setSelectedChat(data._id);
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
    setIsNewChatOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] relative overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#202c33] border-b border-[var(--border-color)] z-10">
        <Link to="/profile">
          <div className="relative cursor-pointer">
            <img
              src={currentUser?.profilePic ? `${BASE_URL}/${currentUser.profilePic}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}&background=128C7E&color=fff`}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#202c33]" />
          </div>
        </Link>

        <div className="flex items-center space-x-3 text-gray-500 dark:text-[#aebac1]">
          <button onClick={toggleDarkMode} className="p-2 hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => navigate('/group/create')} className="p-2 hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors" title="New Group">
            <Users className="w-5 h-5" />
          </button>
          <button onClick={() => setIsNewChatOpen(true)} className="p-2 hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors" title="New Chat">
            <MessageSquarePlus className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }} 
              className={`p-2 hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors ${isMenuOpen ? 'bg-gray-200 dark:bg-[#374248]' : ''}`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-[200px] bg-white dark:bg-[#233138] rounded-lg shadow-xl z-50 py-2 border border-gray-100 dark:border-transparent">
                <button 
                  onClick={() => { setShowArchived(!showArchived); setIsMenuOpen(false); }}
                  className="w-full text-left px-6 py-3 text-[14.5px] text-[var(--text-main)] hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors"
                >
                  {showArchived ? 'Show All Chats' : 'Archived Chats'}
                </button>
                <button 
                  onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                  className="w-full text-left px-6 py-3 text-[14.5px] text-[var(--text-main)] hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors"
                >
                  Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-6 py-3 text-[14.5px] text-red-500 hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors flex items-center justify-between"
                >
                  Log out
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[var(--border-color)]">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-[#8696a0]" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-[#202c33] border-none rounded-lg text-sm text-[var(--text-main)] placeholder-gray-500 dark:placeholder-[#8696a0] focus:ring-0 focus:outline-none"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Archived Section Header */}
      {!showArchived && archivedCount > 0 && (
        <button 
          onClick={() => setShowArchived(true)}
          className="flex items-center px-4 py-3 border-b border-[var(--border-color)] hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors group"
        >
          <Archive className="w-5 h-5 text-green-500 mr-4" />
          <span className="flex-1 text-left text-[15px] font-medium text-[var(--text-main)]">Archived</span>
          <span className="text-xs text-green-500 font-semibold">{archivedCount}</span>
        </button>
      )}

      {showArchived && (
        <button 
          onClick={() => setShowArchived(false)}
          className="flex items-center px-4 py-2 bg-gray-100 dark:bg-[#182229] text-gray-500 dark:text-[#8696a0] text-xs font-semibold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Chats
        </button>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredChats.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-[#8696a0] text-sm">
            <MessageSquarePlus className="w-8 h-8 mb-2 opacity-50" />
            <p>{showArchived ? 'No archived chats' : 'No chats yet. Start a new one!'}</p>
          </div>
        )}

        {filteredChats.map((chat) => {
          const { name, avatar } = getChatDisplay(chat);
          const otherUser = chat.participants?.find(p => String(p._id) !== myIdStr);
          const isOnline = onlineUsers.includes(String(otherUser?._id));
          const lastMsg = chat.latestMessage;
          const isMuted = chat.mutedBy?.some(id => String(id) === myIdStr);
          const isArchived = chat.archivedBy?.some(id => String(id) === myIdStr);

          return (
            <div
              key={chat._id}
              onClick={() => setSelectedChat(chat._id)}
              className={`group flex items-center px-4 py-3 cursor-pointer transition-colors ${selectedChat === chat._id ? 'bg-gray-100 dark:bg-[#2a3942]' : 'hover:bg-gray-50 dark:hover:bg-[#202c33]'}`}
            >
              <div className="relative mr-4 flex-shrink-0">
                <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                {isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#111b21]" />}
              </div>

              <div className="flex-1 min-w-0 border-b border-[var(--border-color)] pb-3 pt-1">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-[17px] font-medium text-[var(--text-main)] truncate flex items-center">
                    {name}
                    {isMuted && <BellOff className="w-3 h-3 text-gray-400 ml-2" />}
                  </h3>
                  <span className={`text-xs ${chat.unreadCount > 0 ? 'text-green-500 font-semibold' : 'text-gray-500 dark:text-[#8696a0]'}`}>
                    {lastMsg ? new Date(lastMsg.createdAt || chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[14px] text-gray-500 dark:text-[#8696a0] truncate flex-1 mr-2">
                    {typingChats[chat._id] ? (
                      <span className="text-green-500 font-medium">typing...</span>
                    ) : (
                      lastMsg?.text || 'No messages yet'
                    )}
                  </p>
                  <div className="flex items-center space-x-2 relative">
                    {chat.unreadCount > 0 && (
                      <span className="bg-[#25D366] text-white text-[12px] font-semibold min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-1 shadow-sm">
                        {chat.unreadCount}
                      </span>
                    )}
                    
                    {/* Chat Menu Trigger */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveChatMenu(activeChatMenu === chat._id ? null : chat._id);
                      }}
                      className={`p-1 text-gray-400 hover:text-gray-600 dark:hover:text-[#aebac1] opacity-0 group-hover:opacity-100 transition-opacity ${activeChatMenu === chat._id ? 'opacity-100' : ''}`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>

                    {/* Chat Menu Dropdown */}
                    {activeChatMenu === chat._id && (
                      <div 
                        className="absolute right-0 top-8 w-44 bg-white dark:bg-[#233138] rounded-md shadow-xl z-50 py-1 border border-gray-100 dark:border-transparent animate-in fade-in zoom-in duration-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          onClick={(e) => handleToggleArchive(e, chat._id)}
                          className="w-full text-left px-4 py-2.5 text-[14px] text-[var(--text-main)] hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors flex items-center"
                        >
                          <Archive className="w-4 h-4 mr-3 text-gray-500" /> 
                          {isArchived ? 'Unarchive chat' : 'Archive chat'}
                        </button>
                        <button 
                          onClick={(e) => handleToggleMute(e, chat._id)}
                          className="w-full text-left px-4 py-2.5 text-[14px] text-[var(--text-main)] hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors flex items-center"
                        >
                          {isMuted ? (
                            <>
                              <Sun className="w-4 h-4 mr-3 text-gray-500" /> Unmute
                            </>
                          ) : (
                            <>
                              <BellOff className="w-4 h-4 mr-3 text-gray-500" /> Mute
                            </>
                          )}
                        </button>
                        <button 
                          onClick={(e) => {
                            handleDeleteChat(e, chat);
                            setActiveChatMenu(null);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[14px] text-red-500 hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors flex items-center border-t border-gray-100 dark:border-[#374248]"
                        >
                          <Trash2 className="w-4 h-4 mr-3" /> Delete chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        onClose={() => setIsNewChatOpen(false)}
        onSelectUser={handleStartNewChat}
        currentUser={currentUser}
      />
    </div>
  );
}
