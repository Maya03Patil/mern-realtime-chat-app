import express from "express";
import { register, login, upload, getAllUsers, updateProfile } from "../controller/authController.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();

router.post("/register", upload.single('profilePic'), register);
router.post("/login", login);
router.get("/users", auth, getAllUsers);
router.put("/profile", auth, upload.single('profilePic'), updateProfile);

export default router;
