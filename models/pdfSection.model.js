import pool from "../config/db.js";

export const PdfSectionModel = {
  create: async ({ cotizacion_id, tipo, titulo, contenido, orden }) => {
    const [result] = await pool.query(
      `INSERT INTO pdf_sections 
       (cotizacion_id, tipo, titulo, contenido, orden)
       VALUES (?, ?, ?, ?, ?)`,
      [
        cotizacion_id,
        tipo,
        titulo || null,
        JSON.stringify(contenido),
        orden
      ]
    );
    return result.insertId;
  },

  getByCotizacion: async (cotizacion_id) => {
    const [rows] = await pool.query(
      `SELECT * FROM pdf_sections
       WHERE cotizacion_id = ?
       ORDER BY orden ASC`,
      [cotizacion_id]
    );
    return rows.map(r => ({
      ...r,
      contenido: JSON.parse(r.contenido)
    }));
  },

  update: async (id, { titulo, contenido, orden }) => {
    await pool.query(
      `UPDATE pdf_sections
       SET titulo = ?, contenido = ?, orden = ?
       WHERE id = ?`,
      [
        titulo,
        JSON.stringify(contenido),
        orden,
        id
      ]
    );
  },

  remove: async (id) => {
    await pool.query(
      `DELETE FROM pdf_sections WHERE id = ?`,
      [id]
    );
  }
};
