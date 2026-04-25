import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Please use a valid Gmail address']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePic: {
        type: String,

    },
    about: {
        type: String,
    },
    lastSeen: {
        type: Date,
    },
    isOnline: {
        type: Boolean,
    },
    phone: {
        type: String,
        sparse: true,
        unique: true
    }
}, { timestamps: true })

const User = mongoose.model("User", UserSchema, "User")
export default User
