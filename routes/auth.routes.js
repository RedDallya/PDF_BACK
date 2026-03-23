import express from "express";
import { login } from "../controllers/auth.controller.js";
import { refresh } from "../controllers/refresh.token.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refresh);

export default router;