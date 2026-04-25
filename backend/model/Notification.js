import mongoose from "mongoose";
const NotificationSchema = new mongoose.Schema({
    receiverId: {
        type: String,
        ref: "User"
    },
    senderId: {
        type: String,
        ref: "User"
    },
    type: {
        enum: ["message", "group_add", "call", "system"]
    },
    message: {
        type: String,
    },
    read: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })
const Notification = mongoose.model("Notification", NotificationSchema, "Notification")
export default Notification