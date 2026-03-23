import bcrypt from "bcrypt";
import db from "../config/db.js";
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/generateToken.js";

/* =========================
LOGIN
========================= */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ error: "Username y password son requeridos" });
    }

    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE username = ? LIMIT 1",
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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        rol: user.rol
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Error interno en login" });
  }
};