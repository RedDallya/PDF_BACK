import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT id, username, rol FROM usuarios");
  res.json(rows);
});

export default router;
