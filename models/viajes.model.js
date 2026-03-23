import db from "../config/db.js";

/* =========================================
JOIN BASE DE OWNERSHIP
========================================= */
const OWNERSHIP_JOIN = `
  FROM viajes v
  JOIN clientes c ON v.cliente_id = c.id
`;

/* =========================================
GET VIAJES POR CLIENTE (ownership)
========================================= */
export async function getViajesByCliente(clienteId, userId) {
  const [rows] = await db.query(
    `
    SELECT v.*
    ${OWNERSHIP_JOIN}
    WHERE v.cliente_id = ?
      AND c.created_by = ?
    ORDER BY v.id DESC
    `,
    [clienteId, userId]
  );

  return rows;
}

/* =========================================
GET VIAJE BY ID (ownership)
========================================= */
export async function getViajeById(id, userId) {
  const [rows] = await db.query(
    `
    SELECT v.*
    ${OWNERSHIP_JOIN}
    WHERE v.id = ?
      AND c.created_by = ?
    `,
    [id, userId]
  );

  return rows[0] || null;
}

/* =========================================
CREATE VIAJE (valida cliente del usuario)
========================================= */
export async function createViaje(conn, data) {
  const {
    cliente_id,
    destino,
    fecha_salida,
    fecha_regreso,
    descripcion,
    userId
  } = data;

  // validar que el cliente sea del usuario
  const [check] = await conn.query(
    `
    SELECT id FROM clientes
    WHERE id = ?
      AND created_by = ?
    `,
    [cliente_id, userId]
  );

  if (check.length === 0) {
    throw new Error("Cliente no pertenece al usuario");
  }

  const [result] = await conn.query(
    `
    INSERT INTO viajes
    (cliente_id, destino, fecha_salida, fecha_regreso, descripcion)
    VALUES (?, ?, ?, ?, ?)
    `,
    [cliente_id, destino, fecha_salida, fecha_regreso, descripcion]
  );

  return result.insertId;
}

/* =========================================
UPDATE VIAJE
========================================= */
export async function updateViaje(conn, id, data) {
  const {
    destino,
    fecha_salida,
    fecha_regreso,
    descripcion
  } = data;

  await conn.query(
    `
    UPDATE viajes
    SET destino = ?,
        fecha_salida = ?,
        fecha_regreso = ?,
        descripcion = ?
    WHERE id = ?
    `,
    [destino, fecha_salida, fecha_regreso, descripcion, id]
  );
}

/* =========================================
DELETE VIAJE
========================================= */
export async function deleteViaje(conn, id) {
  await conn.query(
    `DELETE FROM viajes WHERE id = ?`,
    [id]
  );
}
