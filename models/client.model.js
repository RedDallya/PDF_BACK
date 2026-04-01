import pool from "../config/db.js";

export const ClientModel = {

  /*
  ===========================
  CREATE
  ===========================
  */
  create: async ({
    nombre,
    email,
    telefono,
    notas,
    status,
    location,
    created_by
  }) => {

    const [result] = await pool.query(
      `INSERT INTO clientes
      (nombre, email, telefono, notas, status, location, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        email,
        telefono,
        notas || null,
        status || "nuevo",
        location || null,
        created_by
      ]
    );

    return result.insertId;
  },

  /*
  ===========================
  GET ALL (GLOBAL)
  ===========================
  */
  getAll: async () => {
    const [rows] = await pool.query(
      `SELECT * FROM clientes 
       ORDER BY id DESC`
    );
    return rows;
  },

  /*
  ===========================
  GET BY ID (GLOBAL)
  ===========================
  */
  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT * FROM clientes 
       WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  /*
  ===========================
  UPDATE (SOLO OWNER)
  ===========================
  */
  update: async (id, data, userId) => {

    const {
      nombre,
      email,
      telefono,
      notas,
      status,
      location
    } = data;

    const [result] = await pool.query(
      `UPDATE clientes SET
        nombre = ?,
        email = ?,
        telefono = ?,
        notas = ?,
        status = ?,
        location = ?
      WHERE id = ? AND created_by = ?`,
      [
        nombre,
        email,
        telefono,
        notas || null,
        status || "nuevo",
        location || null,
        id,
        userId
      ]
    );

    return result.affectedRows > 0;
  },

  /*
  ===========================
  DELETE (SOLO OWNER)
  ===========================
  */
  remove: async (id, userId) => {
    const [result] = await pool.query(
      `DELETE FROM clientes 
       WHERE id = ? AND created_by = ?`,
      [id, userId]
    );

    return result.affectedRows > 0;
  }
};