import jwt from "jsonwebtoken";
import db from "../config/db.js";
import {
  JWT_REFRESH_SECRET
} from "../config/jwt.js";
import { generateAccessToken } from "../utils/generateToken.js";

export const refresh = async (req, res) => {
  try {
    const refreshToken =
      req.body?.refreshToken ||
      req.body?.token ||
      null;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token requerido" });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    if (decoded.type !== "refresh") {
      return res.status(401).json({ error: "Refresh inválido" });
    }

    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE id = ? LIMIT 1",
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = rows[0];
    const accessToken = generateAccessToken(user);

    return res.json({ accessToken });
  } catch (err) {
    console.error("REFRESH ERROR:", err);
    return res.status(401).json({ error: "Refresh inválido o expirado" });
  }
};