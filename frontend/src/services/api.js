import axios from 'axios';

const BASE_URL = 'http://localhost:4001/api';

const api = axios.create({ baseURL: BASE_URL });

// Auto-attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auth ──────────────────────────────────────────────────
export const registerAPI = (formData) =>
  api.post('/auth/register', formData); // FormData (multipart)

export const loginAPI = (data) =>
  api.post('/auth/login', data);

export const getAllUsersAPI = (search = '') =>
  api.get(`/auth/users?search=${search}`);

export const updateProfileAPI = (data) =>
  api.put('/auth/profile', data);

// ── Chats ─────────────────────────────────────────────────
export const getChatsAPI = () =>
  api.get('/chat');

export const createGroupAPI = (data) =>
  api.post('/chat/group', data);

export const markAsSeenAPI = (chatId) =>
  api.patch('/chat/seen', { chatId });

export const createOrGetChatAPI = (userId) =>
  api.post('/chat', { userId });

export const toggleArchiveAPI = (chatId) =>
  api.patch(`/chat/archive/${chatId}`);

export const toggleMuteAPI = (chatId) =>
  api.patch(`/chat/mute/${chatId}`);

// ── Messages ──────────────────────────────────────────────
export const getMessagesAPI = (chatId) =>
  api.get(`/chat/messages/${chatId}`);

export const sendMessageAPI = (chatId, text) =>
  api.post('/chat/send', { chatId, text });

export const deleteMessageAPI = (messageId) =>
  api.delete(`/chat/message/${messageId}`);

export const deleteChatAPI = (chatId) =>
  api.delete(`/chat/${chatId}`);

export default api;
