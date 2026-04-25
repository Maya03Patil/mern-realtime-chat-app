import mongoose from "mongoose";
const ChatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    isGroup: {
        type: Boolean,
        default: false
    },
    groupName: {
        type: String,
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    groupImage: {
        type: String,
    },
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    archivedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    mutedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
}, { timestamps: true })
ChatSchema.index({ participants: 1 })
const Chat = mongoose.model("Chat", ChatSchema, "Chat")
export default Chat