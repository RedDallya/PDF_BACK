import pool from "../config/db.js";

export const ClientDocumentsModel = {

  create: async (data) => {

    const [result] = await pool.query(
      `INSERT INTO client_documents
      (client_id,type,number,expiry,notes,file_name,file_path)
      VALUES (?,?,?,?,?,?,?)`,
      [
        data.client_id,
        data.type,
        data.number,
        data.expiry || null,
        data.notes || null,
        data.file_name || null,
        data.file_path || null
      ]
    );

    return result.insertId;
  },

  getByClient: async (clientId) => {

    const [rows] = await pool.query(
      `SELECT * FROM client_documents WHERE client_id = ?`,
      [clientId]
    );

    return rows;
  },

  remove: async (id) => {
    await pool.query("DELETE FROM client_documents WHERE id = ?", [id]);
  }

};
