import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES } from "../config/jwt.js";

export function generateToken(user) {

  return jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES
    }
  );

}
