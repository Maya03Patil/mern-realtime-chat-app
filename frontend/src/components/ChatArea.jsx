import React, { useState, useRef, useEffect } from 'react';
import { Search, MoreVertical, Paperclip, Smile, Mic, Send, ArrowLeft, Check, CheckCheck, Loader, Trash2, ChevronDown, Reply, Copy } from 'lucide-react';
import { getMessagesAPI, sendMessageAPI, markAsSeenAPI, deleteMessageAPI } from '../services/api';
import { getSocket } from '../services/socket';

const BASE_URL = 'http://localhost:4001';

export default function ChatArea({ chat, currentUser, onBack, onlineUsers = [], fetchChats }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // Stores messageId
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastEmitRef = useRef(0);

  // Close menu when clicking anywhere else
  useEffect(() => {
    const closeMenu = () => setActiveMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleMarkAsSeen = async (force = false) => {
    // Only call API if there are unread messages to avoid infinite loops, OR if forced (new message)
    if (!chat?._id) return;
    if (!force && (!chat.unreadCount || chat.unreadCount <= 0)) return;
    
    try {
      await markAsSeenAPI(chat._id);
      if (fetchChats) fetchChats();
    } catch (err) {
      console.error("Mark as seen failed:", err);
    }
  };



  const myId = currentUser?.id || currentUser?._id;
  const other = chat?.participants?.find(p => p._id !== myId);
  const isOtherOnline = onlineUsers.includes(String(other?._id));

  const chatName = chat?.isGroup ? chat.groupName : (other?.name || 'Unknown');
  const chatAvatar = chat?.isGroup
    ? (chat.groupImage ? `${BASE_URL}/${chat.groupImage}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.groupName)}&background=128C7E&color=fff`)
    : (other?.profilePic ? `${BASE_URL}/${other.profilePic}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=128C7E&color=fff`);

  // Use the following for the status line in the render:
  // {isTyping ? <span className="text-green-500 animate-pulse">typing...</span> : (chat.isGroup ? `${chat.participants?.length} members` : (isOtherOnline ? 'online' : 'offline'))}

  useEffect(() => {
    if (!chat?._id) return;
    setMessages([]);
    setLoading(true);
    getMessagesAPI(chat._id)
      .then(({ data }) => {
        setMessages(data);
        handleMarkAsSeen(); // Mark messages as seen when opening
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    const socket = getSocket();
    if (socket) {
      socket.emit('joinChat', chat._id);

      socket.on('receiveMessage', ({ chatId, message }) => {
        if (String(chatId) === String(chat._id)) {
          setMessages(prev => [...prev, message]);
          handleMarkAsSeen(true);
        }
      });

      socket.on('messageDeleted', ({ chatId, messageId }) => {
        if (String(chatId) === String(chat._id)) {
          setMessages(prev => prev.filter(m => m._id !== messageId));
          if (fetchChats) fetchChats();
        }
      });

      socket.on('typing', ({ chatId }) => {
        if (String(chatId) === String(chat._id)) {
          setIsTyping(true);
        }
      });

      socket.on('stopTyping', ({ chatId }) => {
        if (String(chatId) === String(chat._id)) {
          setIsTyping(false);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receiveMessage');
        socket.off('messageDeleted');
        socket.off('typing');
        socket.off('stopTyping');
      }
    };
  }, [chat?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    const text = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      const { data } = await sendMessageAPI(chat._id, text);
      setMessages(prev => [...prev, data]);
      const socket = getSocket();
      if (socket) {
        const participantIds = chat.participants.map(p => p._id || p);
        socket.emit('sendMessage', { 
          chatId: chat._id, 
          message: data, 
          participants: participantIds 
        });
      }
    } catch (err) {
      console.error('Send failed:', err);
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteMessageAPI(msgId);
      setMessages(prev => prev.filter(m => m._id !== msgId));
      if (fetchChats) fetchChats();

      const socket = getSocket();
      if (socket) {
        const participantIds = chat.participants.map(p => p._id || p);
        socket.emit('deleteMessage', { 
          chatId: chat._id, 
          messageId: msgId, 
          participants: participantIds 
        });
      }
    } catch (err) {
      console.error("Delete message failed:", err);
    }
  };

  const renderStatus = (msg) => {
    if (msg.senderId?._id !== myId && msg.senderId !== myId) return null;
    if (msg.status === 'seen') return <CheckCheck className="w-4 h-4 text-blue-500 ml-1 inline" />;
    if (msg.status === 'delivered') return <CheckCheck className="w-4 h-4 text-gray-400 ml-1 inline" />;
    return <Check className="w-4 h-4 text-gray-400 ml-1 inline" />;
  };

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!chat) return null;

  return (
    <div className="flex flex-col h-full w-full relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-[#202c33] border-b border-[var(--border-color)] z-20 sticky top-0">
        <div className="flex items-center flex-1">
          <button onClick={onBack} className="mr-3 md:hidden p-1 hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full text-gray-500 dark:text-[#aebac1]">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src={chatAvatar} alt={chatName} className="w-10 h-10 rounded-full object-cover mr-4" />
          <div>
            <h2 className="text-[16px] font-medium text-[var(--text-main)]">{chatName}</h2>
            <p className="text-[13px] text-gray-500 dark:text-[#8696a0]">
              {isTyping
                ? <span className="text-green-500 animate-pulse">typing...</span>
                : (chat.isGroup ? `${chat.participants?.length} members` : (isOtherOnline ? 'online' : 'offline'))}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-500 dark:text-[#aebac1]">
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors hidden sm:block">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader className="w-6 h-6 text-green-500 animate-spin" />
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex justify-center py-10">
            <span className="bg-white dark:bg-[#202c33] text-gray-500 dark:text-[#8696a0] text-sm py-2 px-4 rounded-lg shadow-sm">
              No messages yet. Say hello! 👋
            </span>
          </div>
        )}

        {messages.map((msg, idx) => {
          const senderIdVal = msg.senderId?._id || msg.senderId;
          const isMine = senderIdVal === myId;
          const senderName = msg.senderId?.name;

          const showDate = idx === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[idx - 1]?.createdAt).toDateString();

          return (
            <React.Fragment key={msg._id}>
              {showDate && (
                <div className="flex justify-center my-4">
                  <span className="bg-white dark:bg-[#202c33] text-gray-500 dark:text-[#8696a0] text-xs font-medium py-1.5 px-3 rounded-lg shadow-sm">
                    {new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              )}
              <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`group relative max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${isMine ? 'bg-green-100 dark:bg-[#005c4b] chat-bubble-send' : 'bg-white dark:bg-[#202c33] chat-bubble-receive'}`}>
                  {!isMine && chat.isGroup && senderName && (
                    <p className="text-xs font-semibold text-blue-500 dark:text-[#53bdeb] mb-1">{senderName}</p>
                  )}
                  <p className="text-[15px] text-gray-800 dark:text-[#e9edef] leading-snug break-words">{msg.text}</p>
                  <div className="flex justify-end items-center mt-1">
                    <span className={`text-[11px] ${isMine ? 'text-green-700/70 dark:text-gray-400' : 'text-gray-500 dark:text-[#8696a0]'}`}>
                      {formatTime(msg.createdAt)}
                    </span>
                    {renderStatus(msg)}
                  </div>
                  
                  {/* Dropdown Menu Trigger */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === msg._id ? null : msg._id);
                    }}
                    className={`absolute right-2 top-1 p-1 text-gray-500 dark:text-[#8696a0] opacity-0 group-hover:opacity-100 transition-opacity hover:text-gray-700 dark:hover:text-white ${activeMenu === msg._id ? 'opacity-100' : ''}`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenu === msg._id && (
                    <div 
                      className={`absolute ${isMine ? 'right-0' : 'left-0'} top-8 w-32 bg-white dark:bg-[#233138] rounded-md shadow-xl z-50 py-1 border border-gray-100 dark:border-transparent animate-in fade-in zoom-in duration-100`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button className="w-full text-left px-3 py-2 text-[13px] text-[var(--text-main)] hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors flex items-center">
                        <Reply className="w-3.5 h-3.5 mr-2" /> Reply
                      </button>
                      <button 
                        className="w-full text-left px-3 py-2 text-[13px] text-[var(--text-main)] hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors flex items-center"
                        onClick={() => {
                          navigator.clipboard.writeText(msg.text);
                          setActiveMenu(null);
                        }}
                      >
                        <Copy className="w-3.5 h-3.5 mr-2" /> Copy
                      </button>
                      {isMine && (
                        <button 
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="w-full text-left px-3 py-2 text-[13px] text-red-500 hover:bg-gray-50 dark:hover:bg-[#182229] transition-colors flex items-center border-t border-gray-100 dark:border-[#374248]"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 sm:px-4 bg-gray-50 dark:bg-[#202c33] border-t border-[var(--border-color)]">
        <form onSubmit={handleSend} className="flex items-center space-x-2 sm:space-x-3">
          <button type="button" className="p-2 text-gray-500 dark:text-[#8696a0] hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors hidden sm:block">
            <Smile className="w-6 h-6" />
          </button>
          <button type="button" className="p-2 text-gray-500 dark:text-[#8696a0] hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            className="flex-1 bg-white dark:bg-[#2a3942] border border-gray-200 dark:border-transparent rounded-xl py-3 px-4 text-[15px] text-[var(--text-main)] placeholder-gray-500 dark:placeholder-[#8696a0] focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm"
            placeholder="Type a message"
            value={inputText}
            onChange={(e) => {
              const val = e.target.value;
              setInputText(val);

              try {
                const socket = getSocket();
                if (socket && chat?._id && val.length > 0) {
                  const participantIds = chat.participants.map(p => p._id || p);
                  const now = Date.now();
                  if (now - lastEmitRef.current > 1500) {
                    socket.emit('typing', { chatId: chat._id, userId: myId, participants: participantIds });
                    lastEmitRef.current = now;
                  }

                  if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                  
                  typingTimeoutRef.current = setTimeout(() => {
                    socket.emit('stopTyping', { chatId: chat._id, userId: myId, participants: participantIds });
                    typingTimeoutRef.current = null;
                  }, 2000);
                }
              } catch (err) {
                console.error("Socket emit error:", err);
              }
            }}
          />
          {inputText.trim() ? (
            <button type="submit" disabled={sending}
              className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm transform active:scale-95 disabled:opacity-60">
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button type="button" className="p-3 text-gray-500 dark:text-[#8696a0] hover:bg-gray-200 dark:hover:bg-[#374248] rounded-full transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
