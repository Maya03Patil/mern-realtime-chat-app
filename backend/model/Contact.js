import mongoose from "mongoose";
const ContactSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    blockedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })
const Contact = mongoose.model("Contact", ContactSchema, "Contact")
export default Contact