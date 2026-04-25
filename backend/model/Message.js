import mongoose from 'mongoose'
const MessageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    text: {
        type: String,
    },
    messageType: {
        enum: ["text", "image", "video", "file", "audio"]
    },
    fileUrl: {
        type: String,
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "seen"],
        default: "sent"
    },
    seenBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    replyTo: {
        type: String,
    },
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true })
MessageSchema.index({ chatId: 1, createdAt: -1 })
const Message = mongoose.model("Message", MessageSchema, "Message")
export default Message