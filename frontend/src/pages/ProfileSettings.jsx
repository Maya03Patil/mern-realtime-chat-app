import React, { useState, useRef } from 'react';
import { ArrowLeft, Edit2, Camera, Check, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updateProfileAPI } from '../services/api';

const BASE_URL = 'http://localhost:4001';

export default function ProfileSettings({ currentUser, setCurrentUser }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [name, setName] = useState(currentUser?.name || '');
  const [about, setAbout] = useState(currentUser?.about || 'Hey there! I am using ChatSphere.');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [loading, setLoading] = useState(false);

  const avatar = currentUser?.profilePic
    ? `${BASE_URL}/${currentUser.profilePic}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}&background=128C7E&color=fff`;

  const handleUpdate = async (field, value) => {
    setLoading(true);
    try {
      const { data } = await updateProfileAPI({ [field]: value });
      // Update local storage and state
      const updatedUser = { ...currentUser, ...data };
      setCurrentUser(updatedUser);
      if (field === 'name') setIsEditingName(false);
      if (field === 'about') setIsEditingAbout(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    setLoading(true);
    try {
      const { data } = await updateProfileAPI(formData);
      setCurrentUser({ ...currentUser, ...data });
    } catch (err) {
      console.error("Failed to upload avatar:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#EFEAE2] dark:bg-[#0b141a]">
      <div className="w-full md:w-[380px] lg:w-[420px] h-full bg-[var(--bg-surface)] flex flex-col border-r border-[var(--border-color)]">
        {/* Header */}
        <div className="bg-[#008069] dark:bg-[#202c33] text-white flex items-end h-[108px] pb-4 px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center space-x-6 cursor-pointer" onClick={() => navigate('/')}>
            <ArrowLeft className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-[#111b21]">
          {/* Avatar Section */}
          <div className="flex justify-center py-8 bg-white dark:bg-[#111b21] shadow-sm">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current.click()}>
              <img src={avatar} alt="Profile" className="w-[200px] h-[200px] rounded-full object-cover shadow-md group-hover:opacity-80 transition-opacity" />
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-full transition-opacity">
                <Camera className="w-8 h-8 text-white mb-2" />
                <span className="text-sm text-white font-medium text-center px-4 uppercase">Change Profile Photo</span>
              </div>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                  <Loader className="w-10 h-10 text-white animate-spin" />
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* Name Section */}
          <div className="bg-white dark:bg-[#111b21] px-7 py-4 mt-2 shadow-sm">
            <p className="text-[#008069] dark:text-[#00a884] text-[14px] mb-4">Your name</p>
            <div className="flex items-center justify-between border-b-2 border-transparent focus-within:border-[#008069] dark:focus-within:border-[#00a884] pb-2 transition-colors">
              {isEditingName ? (
                <div className="flex-1 flex items-center">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-none text-[17px] text-[var(--text-main)]"
                    autoFocus
                  />
                  <button onClick={() => handleUpdate('name', name)} className="text-[#00a884] ml-2">
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <p className="flex-1 text-[17px] text-[var(--text-main)] truncate">{name}</p>
                  <button onClick={() => setIsEditingName(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#8696a0]">
                    <Edit2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            <p className="text-[13px] text-gray-500 dark:text-[#8696a0] mt-4 leading-snug">
              This is not your username or pin. This name will be visible to your ChatSphere contacts.
            </p>
          </div>

          {/* About Section */}
          <div className="bg-white dark:bg-[#111b21] px-7 py-4 mt-2 shadow-sm">
            <p className="text-[#008069] dark:text-[#00a884] text-[14px] mb-4">About</p>
            <div className="flex items-center justify-between border-b-2 border-transparent focus-within:border-[#008069] dark:focus-within:border-[#00a884] pb-2 transition-colors">
              {isEditingAbout ? (
                <div className="flex-1 flex items-center">
                  <input 
                    type="text" 
                    value={about} 
                    onChange={(e) => setAbout(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:outline-none text-[17px] text-[var(--text-main)]"
                    autoFocus
                  />
                  <button onClick={() => handleUpdate('about', about)} className="text-[#00a884] ml-2">
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <>
                  <p className="flex-1 text-[17px] text-[var(--text-main)] truncate">{about}</p>
                  <button onClick={() => setIsEditingAbout(true)} className="text-gray-400 hover:text-gray-600 dark:hover:text-[#8696a0]">
                    <Edit2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Email Section (Read-only) */}
          <div className="bg-white dark:bg-[#111b21] px-7 py-4 mt-2 shadow-sm pb-10">
            <p className="text-[#008069] dark:text-[#00a884] text-[14px] mb-4">Email</p>
            <p className="flex-1 text-[17px] text-[var(--text-main)]">{currentUser?.email}</p>
          </div>

        </div>
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
