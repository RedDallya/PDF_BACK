import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import db from "../config/db.js";
import { JWT_SECRET, JWT_EXPIRES } from "../config/jwt.js";

/* =========================
LOGIN
========================= */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE username = ?",
      [username]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({ accessToken });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
