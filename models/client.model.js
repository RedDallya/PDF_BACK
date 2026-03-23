import pool from "../config/db.js";

export const ClientModel = {

 create: async ({ nombre, email, telefono, notas, status, location }) => {

  const [result] = await pool.query(
    `INSERT INTO clientes
    (nombre, email, telefono, notas, status, location)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      email,
      telefono,
      notas || null,
      status || "nuevo",
      location || null
    ]
  );

  return result.insertId;
},


  getAll: async () => {
    const [rows] = await pool.query(`SELECT * FROM clientes ORDER BY id DESC`);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await pool.query(`SELECT * FROM clientes WHERE id = ?`, [id]);
    return rows[0];
  },

 update: async (id, data) => {

  const {
    nombre,
    email,
    telefono,
    notas,
    status,
    location
  } = data;

  await pool.query(
    `UPDATE clientes SET
      nombre = ?,
      email = ?,
      telefono = ?,
      notas = ?,
      status = ?,
      location = ?
    WHERE id = ?`,
    [
      nombre,
      email,
      telefono,
      notas || null,
      status || "nuevo",
      location || null,
      id
    ]
  );

  return true;
},


  remove: async (id) => {
    await pool.query(`DELETE FROM clientes WHERE id = ?`, [id]);
    return true;
  },
  getByIdWithTags: async (id) => {

  const [rows] = await pool.query(`
    SELECT 
      c.*,
      GROUP_CONCAT(t.nombre) AS tags
    FROM clientes c
    LEFT JOIN cliente_tags ct ON c.id = ct.cliente_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    WHERE c.id = ?
    GROUP BY c.id
  `, [id]);

  return rows[0];
}
};



