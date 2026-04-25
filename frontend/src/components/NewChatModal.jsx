import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Loader } from 'lucide-react';
import { getAllUsersAPI } from '../services/api';

const BASE_URL = 'http://localhost:4001';

export default function NewChatModal({ isOpen, onClose, onSelectUser, currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    getAllUsersAPI()
      .then(({ data }) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-[var(--bg-surface)] z-30 flex flex-col">
      {/* Header */}
      <div className="bg-[#008069] dark:bg-[#202c33] text-white flex items-end h-[108px] pb-4 px-6 shrink-0 shadow-sm">
        <div className="flex items-center space-x-6 cursor-pointer" onClick={onClose}>
          <ArrowLeft className="w-6 h-6" />
          <h1 className="text-[19px] font-medium">New chat</h1>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-[var(--border-color)]">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-[#8696a0]" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-[#202c33] border-none rounded-lg text-sm text-[var(--text-main)] placeholder-gray-500 dark:placeholder-[#8696a0] focus:ring-0 focus:outline-none"
            placeholder="Search name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader className="w-6 h-6 text-green-500 animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex justify-center py-10 text-gray-400 dark:text-[#8696a0] text-sm">
            No users found
          </div>
        )}

        <div className="px-4 py-3">
          <span className="text-teal-600 dark:text-[#00a884] text-[13px] font-medium uppercase tracking-wide">
            Contacts on ChatSphere
          </span>
        </div>

        {filtered.map((user) => {
          const avatar = user.profilePic
            ? `${BASE_URL}/${user.profilePic}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=128C7E&color=fff`;

          return (
            <div
              key={user._id}
              onClick={() => onSelectUser(user)}
              className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#202c33] transition-colors"
            >
              <img src={avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover mr-4" />
              <div className="flex-1 min-w-0 border-b border-[var(--border-color)] pb-3 pt-1">
                <h3 className="text-[17px] text-[var(--text-main)] truncate">{user.name}</h3>
                <p className="text-[14px] text-gray-500 dark:text-[#8696a0] truncate">{user.about || user.email}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
