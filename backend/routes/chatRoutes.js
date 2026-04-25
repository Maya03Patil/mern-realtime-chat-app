import express from "express";
import { auth } from "../middleware/auth.js";
import { 
    createOrGetChat, 
    getChats, 
    getMessages, 
    sendMessage, 
    createGroup, 
    markAsSeen,
    deleteMessage,
    deleteChat,
    toggleArchive,
    toggleMute
} from "../controller/chatController.js";

const router = express.Router();

router.post("/", auth, createOrGetChat);
router.post("/group", auth, createGroup);
router.patch("/seen", auth, markAsSeen);
router.patch("/archive/:id", auth, toggleArchive);
router.patch("/mute/:id", auth, toggleMute);
router.get("/", auth, getChats);
router.get("/messages/:id", auth, getMessages);
router.post("/send", auth, sendMessage);
router.delete("/message/:id", auth, deleteMessage);
router.delete("/:id", auth, deleteChat);

export default router;