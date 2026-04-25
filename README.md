# WhatsApp Clone - MERN Stack

A modern, real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.io. This project features private messaging, group chats, real-time typing indicators, message "seen" status, and WhatsApp-style archive/mute functionality.

## ✨ Features

- 📱 **Phone & Email Login**: Secure authentication with JWT.
- 🔒 **End-to-End Encryption**: Messages are encrypted locally using AES-256 before sending.
- 💬 **Real-time Messaging**: Instant message delivery using Socket.io.
- 👥 **Group Chats**: Create and manage group conversations.
- ✅ **Message Status**: Sent, Delivered, and Seen ticks.
- ⌨️ **Typing Indicators**: See when your friends are typing.
- 📦 **Archive & Mute**: WhatsApp-style chat management.
- 🗑️ **Delete Messages**: Remove messages for yourself or delete entire chats.
- 🌙 **Dark Mode**: Beautiful dark and light themes.

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Maya03Patil/ChatApp.git
   cd ChatApp
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   - Create a `.env` file in the `backend` folder (use `.env.example` as a template).
   - Start the server:
   ```bash
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   - Start the React dev server:
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS (optional), Lucide Icons, Socket.io-client.
- **Backend**: Node.js, Express, MongoDB, Mongoose, Socket.io.
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt.

## 📂 Project Structure

```text
├── backend/           # Node.js Express server
│   ├── controller/    # API logic
│   ├── model/         # Database schemas
│   ├── routes/        # API endpoints
│   └── server.js      # Entry point & Socket.io setup
├── frontend/          # React Vite application
│   ├── src/
│   │   ├── components/# Reusable UI components
│   │   ├── pages/     # Main page views
│   │   └── services/  # API & Socket configurations
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

