import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { checkAuth, login, signup, updateProfile } from "../Controllers/userController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/check", protectRoute, checkAuth);
router.post("/update-profile", protectRoute, updateProfile);

export default router;
