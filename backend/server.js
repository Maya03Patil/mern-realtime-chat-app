import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
const httpServer = createServer(app);

const ALLOWED_ORIGINS = ['http://localhost:5173'];

const io = new Server(httpServer, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ['GET', 'POST']
    }
});

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.get("/", (req, res) => {
    res.send("Chat App Backend is running");
});

// Track online users: { userId -> Set of socketIds }
const onlineUsers = new Map();

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        socket.join(`user_${userId}`); // Join personal room

        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        // Broadcast updated online users list
        io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
        console.log(`User connected: ${userId} (Total sockets: ${onlineUsers.get(userId).size})`);
    }

    socket.on("sendMessage", ({ chatId, message, participants }) => {
        // Notify all participants to refresh their chat lists and receive the message
        if (participants && Array.isArray(participants)) {
            participants.forEach(pId => {
                io.to(`user_${pId}`).emit("receiveMessage", { chatId, message });
                io.to(`user_${pId}`).emit("updateChat", { chatId });
            });
        }
    });

    socket.on("joinChat", (chatId) => {
        socket.join(`chat_${chatId}`);
    });

    socket.on("typing", ({ chatId, userId, participants }) => {
        if (participants && Array.isArray(participants)) {
            participants.forEach(pId => {
                // Don't send to self
                if (String(pId) !== String(userId)) {
                    io.to(`user_${pId}`).emit("typing", { chatId, userId });
                }
            });
        }
    });

    socket.on("stopTyping", ({ chatId, participants, userId }) => {
        if (participants && Array.isArray(participants)) {
            participants.forEach(pId => {
                if (String(pId) !== String(userId)) {
                    io.to(`user_${pId}`).emit("stopTyping", { chatId });
                }
            });
        }
    });

    socket.on("deleteMessage", ({ chatId, messageId, participants }) => {
        if (participants && Array.isArray(participants)) {
            participants.forEach(pId => {
                io.to(`user_${pId}`).emit("messageDeleted", { chatId, messageId });
            });
        }
    });

    socket.on("deleteChat", ({ chatId, participants }) => {
        if (participants && Array.isArray(participants)) {
            participants.forEach(pId => {
                io.to(`user_${pId}`).emit("chatDeleted", { chatId });
            });
        }
    });



    socket.on("disconnect", () => {
        if (userId && onlineUsers.has(userId)) {
            onlineUsers.get(userId).delete(socket.id);
            if (onlineUsers.get(userId).size === 0) {
                onlineUsers.delete(userId);
            }
            io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
            console.log(`User disconnected: ${userId}`);
        }
    });
});

connectDB();

httpServer.listen(process.env.PORT, () => {
    console.log(`Server is running on port at http://localhost:${process.env.PORT}`);
});

export { io };
