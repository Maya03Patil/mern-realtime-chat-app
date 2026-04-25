import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Check, Search, X, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllUsersAPI, createGroupAPI } from '../services/api';

const BASE_URL = 'http://localhost:4001';

export default function GroupCreate() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getAllUsersAPI()
      .then(({ data }) => setAllContacts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredContacts = allContacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleContact = (contact) => {
    const contactId = contact._id || contact.id;
    if (selectedContacts.find(c => (c._id || c.id) === contactId)) {
      setSelectedContacts(selectedContacts.filter(c => (c._id || c.id) !== contactId));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim() || selectedContacts.length === 0 || creating) return;
    
    setCreating(true);
    try {
      const participantIds = selectedContacts.map(c => c._id || c.id);
      await createGroupAPI({ name: groupName, participants: participantIds });
      navigate('/');
    } catch (err) {
      console.error("Failed to create group:", err);
      alert("Failed to create group. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const getAvatar = (user) => {
    if (user.profilePic) return `${BASE_URL}/${user.profilePic}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=128C7E&color=fff`;
  };

  return (
    <div className="flex h-screen bg-[#EFEAE2] dark:bg-[#0b141a]">
      <div className="w-full md:w-[380px] lg:w-[420px] h-full bg-[var(--bg-surface)] flex flex-col border-r border-[var(--border-color)] relative">
        {/* Header */}
        <div className="bg-[#008069] dark:bg-[#202c33] text-white flex items-end h-[108px] pb-4 px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center space-x-6 cursor-pointer" onClick={() => navigate('/')}>
            <ArrowLeft className="w-6 h-6" />
            <div className="flex flex-col">
              <h1 className="text-[19px] font-medium leading-tight">New group</h1>
              <span className="text-[13px] text-white/80">Add members</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#111b21]">
          {/* Group Info Section */}
          <div className="flex flex-col items-center py-8 bg-white dark:bg-[#111b21] shadow-sm mb-2">
            <div className="w-[160px] h-[160px] bg-gray-200 dark:bg-[#202c33] rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-[#2a3942] transition-colors mb-6 text-gray-500 dark:text-[#8696a0]">
              <Camera className="w-8 h-8 mb-2" />
              <span className="text-[11px] text-center px-4 uppercase font-medium">Add Group Icon</span>
            </div>
            
            <div className="w-full px-8">
              <input 
                type="text" 
                placeholder="Group Subject" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={25}
                className="w-full bg-transparent border-b-2 border-green-500 focus:outline-none py-2 text-[15px] text-[var(--text-main)] placeholder-gray-400 dark:placeholder-[#8696a0]"
              />
              <p className="text-right text-[12px] text-gray-400 mt-1">
                {25 - groupName.length}
              </p>
            </div>
          </div>

          {/* Add Members Section */}
          <div className="bg-white dark:bg-[#111b21] shadow-sm flex-1 min-h-0">
            <div className="px-4 py-2 border-b border-[var(--border-color)]">
              <span className="text-[14px] text-teal-600 dark:text-[#00a884] font-medium uppercase tracking-wide">
                Contacts: {selectedContacts.length} selected
              </span>
            </div>
            
            {selectedContacts.length > 0 && (
              <div className="flex overflow-x-auto p-4 space-x-4 border-b border-[var(--border-color)] scrollbar-hide">
                {selectedContacts.map(contact => (
                  <div key={contact._id || contact.id} className="flex flex-col items-center relative group shrink-0">
                    <img src={getAvatar(contact)} alt={contact.name} className="w-12 h-12 rounded-full object-cover mb-1" />
                    <button 
                      onClick={() => toggleContact(contact)}
                      className="absolute top-0 right-0 bg-gray-400 rounded-full p-0.5 border-2 border-white dark:border-[#111b21]"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    <span className="text-xs text-[var(--text-main)] truncate w-16 text-center">{contact.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 border-b border-[var(--border-color)]">
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
                />
              </div>
            </div>

            <div className="pb-24">
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader className="w-6 h-6 text-green-500 animate-spin" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="flex justify-center py-10 text-gray-400 dark:text-[#8696a0] text-sm">
                  No contacts found
                </div>
              ) : (
                filteredContacts.map(contact => {
                  const contactId = contact._id || contact.id;
                  const isSelected = selectedContacts.some(c => (c._id || c.id) === contactId);
                  return (
                    <div 
                      key={contactId} 
                      onClick={() => toggleContact(contact)}
                      className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors"
                    >
                      <div className="relative mr-4">
                        <img src={getAvatar(contact)} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white dark:border-[#111b21]">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 border-b border-[var(--border-color)] pb-3 pt-1">
                        <h3 className="text-[17px] text-[var(--text-main)] truncate">{contact.name}</h3>
                        <p className="text-[14px] text-gray-500 dark:text-[#8696a0] truncate">{contact.about || contact.email}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Create Button */}
        {selectedContacts.length > 0 && groupName.trim() && (
          <div className="absolute bottom-6 flex justify-center w-full pointer-events-none">
            <button 
              onClick={handleCreate}
              disabled={creating}
              className="w-14 h-14 bg-[#00a884] rounded-full flex items-center justify-center shadow-lg hover:bg-[#06cf9c] transition-colors pointer-events-auto transform active:scale-95 disabled:opacity-50"
            >
              {creating ? <Loader className="w-6 h-6 text-white animate-spin" /> : <Check className="w-6 h-6 text-white" />}
            </button>
          </div>
        )}
      </div>

      {/* Empty Space for Desktop */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center relative bg-[#EFEAE2] dark:bg-[#0b141a]">
         <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'url("https://w0.peakpx.com/wallpaper/818/148/HD-wallpaper-whatsapp-background-cool-dark-green-new-theme-whatsapp.jpg")', backgroundSize: 'cover' }}>
        </div>
      </div>
    </div>
  );
}
