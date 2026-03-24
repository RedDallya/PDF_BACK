import dotenv from "dotenv";
import bcrypt from "bcrypt";
import readline from "readline";
import db from "../config/db.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, answer => resolve(answer.trim()));
  });
}

async function run() {
  try {
    const username = await ask("Username: ");
    const password = await ask("Password: ");
    const rolInput = await ask("Rol (admin/user) [admin]: ");

    const rol = rolInput || "admin";

    if (!username || !password) {
      throw new Error("Username y password son obligatorios");
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [exists] = await db.query(
      "SELECT id FROM usuarios WHERE username = ? LIMIT 1",
      [username]
    );

    if (exists.length) {
      throw new Error(`El usuario "${username}" ya existe`);
    }

    const [result] = await db.query(
      "INSERT INTO usuarios (username, password_hash, rol) VALUES (?, ?, ?)",
      [username, passwordHash, rol]
    );

    console.log("✅ Usuario creado correctamente");
    console.log({
      id: result.insertId,
      username,
      rol
    });
  } catch (err) {
    console.error("❌ Error creando usuario:", err.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

run();