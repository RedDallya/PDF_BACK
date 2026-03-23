import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { URL } from "url";

// Carga variables de entorno en desarrollo
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

let config = {};

if (process.env.MYSQL_URL) {
  const url = new URL(process.env.MYSQL_URL);
  config = {
    host: url.hostname,
    port: Number(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.substring(1), // elimina la barra inicial
    waitForConnections: true,
    connectionLimit: 10,
  };
} else {
  config = {
    host: process.env.MYSQLHOST || "localhost",
    port: process.env.MYSQLPORT ? Number(process.env.MYSQLPORT) : 3306,
    user: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "",
    database: process.env.MYSQLDATABASE || "railway",
    waitForConnections: true,
    connectionLimit: 10,
  };
}

const pool = mysql.createPool(config);

pool.getConnection()
  .then(conn => {
    console.log("✅ DB conectado correctamente");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Error conectando a DB:", err.code, err.message);
  });

export default pool;