import jwt from "jsonwebtoken";
import {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRES,
  JWT_REFRESH_EXPIRES
} from "../config/jwt.js";

export function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.rol
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.rol,
      type: "refresh"
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES }
  );
}