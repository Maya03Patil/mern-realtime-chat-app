import Chat from "../model/Chat.js";
import Message from "../model/Message.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// Create or fetch existing 1-to-1 chat between logged-in user and another user
export const createOrGetChat = asyncHandler(async (req, res) => {
    const { userId } = req.body; // the OTHER user's id
    if (!userId) {
        return res.status(400).json({ message: "userId is required" });
    }

    // Check if a private chat already exists between these two users
    let chat = await Chat.findOne({
        isGroup: false,
        participants: { $all: [req.user.id, userId], $size: 2 }
    }).populate("participants", "name email profilePic");

    if (chat) {
        return res.json(chat); // Return existing chat
    }

    // Create new chat
    chat = await Chat.create({
        participants: [req.user.id, userId],
        isGroup: false
    });
    chat = await chat.populate("participants", "name email profilePic");
    res.status(201).json(chat);
});

// Get all chats for logged-in user with unread counts
export const getChats = asyncHandler(async (req, res) => {
    const chats = await Chat.find({ participants: req.user.id })
        .populate("participants", "name email profilePic about")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });

    // For each chat, count messages that don't have this user in seenBy
    const chatsWithUnread = await Promise.all(chats.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
            chatId: chat._id,
            senderId: { $ne: req.user.id },
            seenBy: { $ne: req.user.id }
        });
        return { ...chat.toObject(), unreadCount };
    }));

    res.json(chatsWithUnread);
});

// Mark all messages in a chat as seen
export const markAsSeen = asyncHandler(async (req, res) => {
    const { chatId } = req.body;
    const userId = req.user.id;

    if (!chatId) {
        return res.status(400).json({ message: "chatId is required" });
    }

    // Update all messages where user is not the sender and hasn't seen it yet
    await Message.updateMany(
        {
            chatId,
            senderId: { $ne: userId },
            seenBy: { $ne: userId }
        },
        {
            $addToSet: { seenBy: userId },
            $set: { status: "seen" }
        }
    );

    res.json({ message: "Messages marked as seen" });
});

// Get all messages for a chat
export const getMessages = asyncHandler(async (req, res) => {
    const messages = await Message.find({ chatId: req.params.id })
        .populate("senderId", "name email profilePic")
        .sort({ createdAt: 1 });
    res.json(messages);
});

// Send a message
export const sendMessage = asyncHandler(async (req, res) => {
    const { chatId, text, messageType = "text", fileUrl, replyTo } = req.body;
    const senderId = req.user.id;

    if (!chatId || !text) {
        return res.status(400).json({ message: "chatId and text are required" });
    }

    // Initial seenBy includes the sender
    const message = await Message.create({
        chatId,
        senderId,
        text,
        messageType,
        fileUrl,
        replyTo,
        seenBy: [senderId]
    });

    // Update chat's latestMessage
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    const populated = await message.populate("senderId", "name email profilePic");
    res.status(201).json(populated);
});

// Create a group chat
export const createGroup = asyncHandler(async (req, res) => {
    const { name, participants } = req.body;

    if (!name || !participants || !Array.isArray(participants) || participants.length < 1) {
        return res.status(400).json({ message: "Group name and participants are required" });
    }

    // Add current user to participants if not already there
    const allParticipants = [...new Set([...participants, req.user.id])];

    const chat = await Chat.create({
        groupName: name,
        participants: allParticipants,
        isGroup: true,
        groupAdmin: req.user.id
    });

    const populated = await chat.populate("participants", "name email profilePic");
    res.status(201).json(populated);
});

// Delete a single message
export const deleteMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(id);

    if (!message) {
        return res.status(404).json({ message: "Message not found" });
    }

    // Only the sender can delete their message
    if (message.senderId.toString() !== userId) {
        return res.status(403).json({ message: "You can only delete your own messages" });
    }

    const chatId = message.chatId;
    await Message.findByIdAndDelete(id);

    // If this was the latest message, update the chat's latestMessage
    const chat = await Chat.findById(chatId);
    if (chat.latestMessage && chat.latestMessage.toString() === id) {
        const lastMsg = await Message.findOne({ chatId }).sort({ createdAt: -1 });
        await Chat.findByIdAndUpdate(chatId, { latestMessage: lastMsg ? lastMsg._id : null });
    }

    res.json({ message: "Message deleted successfully" });
});

// Delete an entire chat and its messages
export const deleteChat = asyncHandler(async (req, res) => {
    const { id } = req.params; // chatId
    const userId = req.user.id;

    const chat = await Chat.findById(id);

    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }

    // Verify user is a participant
    if (!chat.participants.includes(userId)) {
        return res.status(403).json({ message: "You are not a participant in this chat" });
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chatId: id });

    // Delete the chat itself
    await Chat.findByIdAndDelete(id);

    res.json({ message: "Chat and all messages deleted" });
});

// Archive or Unarchive a chat
export const toggleArchive = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Check if current user is already in the archivedBy array
    const isArchived = chat.archivedBy.some(id => id.toString() === userId.toString());
    
    const update = isArchived 
        ? { $pull: { archivedBy: userId } } 
        : { $addToSet: { archivedBy: userId } };

    const updatedChat = await Chat.findByIdAndUpdate(id, update, { new: true });
    res.json(updatedChat);
});

// Mute or Unmute a chat
export const toggleMute = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(id);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Check if current user is already in the mutedBy array
    const isMuted = chat.mutedBy.some(id => id.toString() === userId.toString());
    
    const update = isMuted 
        ? { $pull: { mutedBy: userId } } 
        : { $addToSet: { mutedBy: userId } };

    const updatedChat = await Chat.findByIdAndUpdate(id, update, { new: true });
    res.json(updatedChat);
});