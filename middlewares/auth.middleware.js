import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Formato de token inválido" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}