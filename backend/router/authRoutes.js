import express from "express";
import { signup, login, refresh, logout } from "../controllers/authController.js";
import protect from '../middleware/auth.js'

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post('/check',protect)


export default router;

