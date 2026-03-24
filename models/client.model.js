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
  GET ALL (FILTRADO POR USER)
  ===========================
  */
  getAll: async (userId) => {
    const [rows] = await pool.query(
      `SELECT * FROM clientes 
       WHERE created_by = ?
       ORDER BY id DESC`,
      [userId]
    );
    return rows;
  },

  /*
  ===========================
  GET BY ID (FILTRADO)
  ===========================
  */
  getById: async (id, userId) => {
    const [rows] = await pool.query(
      `SELECT * FROM clientes 
       WHERE id = ? AND created_by = ?`,
      [id, userId]
    );
    return rows[0];
  },

  /*
  ===========================
  UPDATE (PROTEGIDO)
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
  DELETE (PROTEGIDO)
  ===========================
  */
  remove: async (id, userId) => {
    const [result] = await pool.query(
      `DELETE FROM clientes 
       WHERE id = ? AND created_by = ?`,
      [id, userId]
    );

    return result.affectedRows > 0;
  },

  /*
  ===========================
  GET WITH TAGS
  ===========================
  */
  getByIdWithTags: async (id, userId) => {

    const [rows] = await pool.query(`
      SELECT 
        c.*,
        GROUP_CONCAT(t.nombre) AS tags
      FROM clientes c
      LEFT JOIN cliente_tags ct ON c.id = ct.cliente_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      WHERE c.id = ? AND c.created_by = ?
      GROUP BY c.id
    `, [id, userId]);

    return rows[0];
  }
};