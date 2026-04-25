import express from "express";
import User from "../model/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
dotenv.config();
const router = express.Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
export const upload = multer({ storage });
export const register = async (req, res, next) => {
    const { name, email, password, about, lastSeen, isOnline, phone } = req.body;
    const profilePic = req.file ? req.file.path : null;
    try {
        const query = { $or: [{ email }] };
        if (phone && phone.trim() !== "") {
            query.$or.push({ phone });
        }

        const existingUser = await User.findOne(query);
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashPassword,
            profilePic,
            about,
            lastSeen,
            isOnline,
            phone
        });
        const safeUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic,
            about: user.about,
            lastSeen: user.lastSeen,
            isOnline: user.isOnline,
            phone: user.phone
        }
        res.status(201).json(safeUser);
    } catch (error) {
        next(error);
    }
}

export const login = async (req, res, next) => {
    const { identifier, password } = req.body;
    try {
        const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "60d" });
        const safeUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            profilePic: user.profilePic
        };

        res.status(200).json({ user: safeUser, token });
    } catch (error) {
        next(error);
    }
}

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } })
            .select("name email profilePic about")
            .sort({ name: 1 });
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}

export const updateProfile = async (req, res, next) => {
    try {
        const { name, about } = req.body;
        const userId = req.user.id;

        const updateData = {};
        if (name) updateData.name = name;
        if (about) updateData.about = about;
        if (req.file) updateData.profilePic = req.file.path;

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
            .select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}