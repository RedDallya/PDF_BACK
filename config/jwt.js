if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET no definido en variables de entorno");
}


export const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";
export const JWT_EXPIRES = "15m";
export const REFRESH_EXPIRES_DAYS = 7;
