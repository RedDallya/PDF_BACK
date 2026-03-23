import pool from "../config/db.js";

export const DocumentModel = {

  // =====================================
  // CREAR DOCUMENTO (COTIZACION)
  // =====================================
  create: async ({ viaje_id, titulo, condicion_legal, estado }) => {

    const [result] = await pool.query(
      `INSERT INTO cotizaciones
      (viaje_id, titulo, condicion_legal, estado)
      VALUES (?, ?, ?, ?)`,
      [
        viaje_id,
        titulo || null,
        condicion_legal || null,
        estado || "borrador"
      ]
    );

    return result.insertId;
  },

  // =====================================
  // OBTENER DOCUMENTOS POR VIAJE
  // =====================================
  getByViaje: async (viaje_id) => {

    const [rows] = await pool.query(
      `SELECT * FROM cotizaciones
       WHERE viaje_id = ?
       ORDER BY created_at DESC`,
      [viaje_id]
    );

    return rows;
  },

  // =====================================
  // OBTENER DOCUMENTO POR ID
  // =====================================
  getById: async (id) => {

    const [rows] = await pool.query(
      `SELECT * FROM cotizaciones WHERE id = ?`,
      [id]
    );

    return rows[0];
  },

  // =====================================
  // ACTUALIZAR DOCUMENTO
  // =====================================
  update: async (id, { titulo, condicion_legal, estado }) => {

    await pool.query(
      `UPDATE cotizaciones
       SET titulo = ?, condicion_legal = ?, estado = ?
       WHERE id = ?`,
      [
        titulo || null,
        condicion_legal || null,
        estado || "borrador",
        id
      ]
    );

    return true;
  },

  // =====================================
  // ELIMINAR DOCUMENTO
  // =====================================
  remove: async (id) => {

    await pool.query(
      `DELETE FROM cotizaciones WHERE id = ?`,
      [id]
    );

    return true;
  }

};
