import db from "../config/db.js";

/* =========================================
OWNERSHIP JOIN BASE
========================================= */
const OWNERSHIP_JOIN = `
  FROM cotizaciones c
  JOIN viajes v    ON c.viaje_id = v.id
  JOIN clientes cl ON v.cliente_id = cl.id
`;

/* =========================================
GET COTIZACIONES POR VIAJE (ownership)
========================================= */
export async function getCotizacionesByViaje(viajeId, userId) {
  const [rows] = await db.query(
    `
    SELECT c.*
    ${OWNERSHIP_JOIN}
    WHERE c.viaje_id = ?
      AND cl.created_by = ?
    ORDER BY c.id ASC
    `,
    [viajeId, userId]
  );

  return rows;
}

/* =========================================
GET COTIZACION BY ID (ownership)
========================================= */
export async function getCotizacionById(id, userId) {
  const [rows] = await db.query(
    `
    SELECT c.*
    ${OWNERSHIP_JOIN}
    WHERE c.id = ?
      AND cl.created_by = ?
    `,
    [id, userId]
  );

  return rows[0] || null;
}

/* =========================================
CREATE COTIZACION (valida viaje del usuario)
========================================= */
export async function createCotizacion(conn, data) {
 const {
  viaje_id,
  titulo,
  condicion_legal,
  created_by
} = data;


  // validar que el viaje pertenezca al usuario
  const [check] = await conn.query(
    `
    SELECT v.id
    FROM viajes v
    JOIN clientes cl ON v.cliente_id = cl.id
    WHERE v.id = ?
      AND cl.created_by = ?
    `,
    [viaje_id, created_by]
  );

  if (check.length === 0) {
    throw new Error("Viaje no pertenece al usuario");
  }

  const [result] = await conn.query(
    `
    INSERT INTO cotizaciones
    (viaje_id, titulo, condicion_legal,created_by, updated_by)
    VALUES (?, ?, ?,?,?)
    `,
    [viaje_id, titulo, condicion_legal, created_by, created_by]
  );

  return result.insertId;
}

/* =========================================
UPDATE COTIZACION (conn, ownership validado)
========================================= */
export async function updateCotizacion(conn, id, data, userId) {
  const {
    titulo,
    condicion_legal,
    estado
  } = data;

  const [result] = await conn.query(
    `
    UPDATE cotizaciones c
    JOIN viajes v    ON c.viaje_id = v.id
    JOIN clientes cl ON v.cliente_id = cl.id
    SET 
      c.titulo = ?,
      c.condicion_legal = ?,
      c.estado = ?
    WHERE c.id = ?
      AND cl.created_by = ?
    `,
    [titulo, condicion_legal, estado, id, userId]
  );

  return result.affectedRows > 0;
}
/* =========================================
DELETE COTIZACION (conn)
========================================= */
export async function deleteCotizacion(conn, id, userId) {
  const [result] = await conn.query(
    `
    DELETE c FROM cotizaciones c
    JOIN viajes v    ON c.viaje_id = v.id
    JOIN clientes cl ON v.cliente_id = cl.id
    WHERE c.id = ?
      AND cl.created_by = ?
    `,
    [id, userId]
  );

  return result.affectedRows > 0;
}
