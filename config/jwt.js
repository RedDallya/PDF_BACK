import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

export const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_local";
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "super_refresh_secret_local";

export const JWT_EXPIRES = process.env.JWT_EXPIRES || "15m";
export const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || "7d";